import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import * as satellite from 'satellite.js';
import { TLEData } from '../types';

interface OrbitVisualizerProps {
  tleData: TLEData | null;
}

const OrbitVisualizer: React.FC<OrbitVisualizerProps> = ({ tleData }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const worldDataRef = useRef<any>(null);
  const projectionRef = useRef<d3.GeoProjection | null>(null);
  const satrecTimerRef = useRef<d3.Timer | null>(null);
  const rotationTimerRef = useRef<d3.Timer | null>(null);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const container = svg.node()?.parentElement;
    if (!container) return;

    if (satrecTimerRef.current) satrecTimerRef.current.stop();
    if (rotationTimerRef.current) rotationTimerRef.current.stop();

    if (!projectionRef.current) {
      projectionRef.current = d3.geoOrthographic().precision(0.1).clipAngle(90);
    }
    const projection = projectionRef.current;
    const pathGenerator = d3.geoPath().projection(projection);

    const redrawAll = () => {
      svg.selectAll("path").attr("d", pathGenerator as any);
    };
    
    const startIdleRotation = (startRotation: [number, number, number] = projection.rotate()) => {
      if (rotationTimerRef.current) rotationTimerRef.current.stop();
      let currentRotation = startRotation;
      rotationTimerRef.current = d3.timer((elapsed) => {
        if (isDraggingRef.current) {
          rotationTimerRef.current?.stop();
          return;
        }
        const newAngle = startRotation[0] + elapsed * 0.01;
        currentRotation = [newAngle, startRotation[1], startRotation[2]];
        projection.rotate(currentRotation);
        redrawAll();
      });
    };

    const drag = d3.drag<SVGSVGElement, unknown>()
      .on('start', () => {
        isDraggingRef.current = true;
        if (rotationTimerRef.current) rotationTimerRef.current.stop();
      })
      .on('drag', (event) => {
        const currentRotate = projection.rotate();
        const k = 75 / projection.scale();
        projection.rotate([
          currentRotate[0] + event.dx * k,
          currentRotate[1] - event.dy * k,
          currentRotate[2]
        ]);
        redrawAll();
      })
      .on('end', () => {
        isDraggingRef.current = false;
        startIdleRotation(projection.rotate());
      });

    svg.call(drag as any);

    const drawScene = () => {
      svg.selectAll('*').remove();
      
      svg.append("path")
        .datum({ type: "Sphere" })
        .attr("d", pathGenerator as any)
        .attr("fill", "#0f172a")
        .attr("stroke", "#38bdf8")
        .attr("stroke-width", 0.5);

      svg.append("path")
        .datum(topojson.feature(worldDataRef.current, worldDataRef.current.objects.countries))
        .attr("d", pathGenerator as any)
        .attr("fill", "#1e293b")
        .attr("stroke", "#334155")
        .attr("stroke-width", 0.5);
    
      svg.append("path")
        .datum(d3.geoGraticule10())
        .attr("d", pathGenerator as any)
        .attr("stroke", "#334155")
        .attr("stroke-width", 0.5)
        .attr("fill", "none");
        
      redrawAll();
    };
    
    const updateSatelliteVisualization = () => {
        svg.selectAll('.orbit, .satellite').remove();

        if (!tleData) {
            startIdleRotation([-100, -20, 0]);
            return;
        }

        try {
            const satrec = satellite.twoline2satrec(tleData.line1, tleData.line2);
            
            // --- Create Satellite Marker & Orbit Path ---
            const satelliteGroup = svg.append('g').attr('class', 'satellite').style('display', 'none');
            satelliteGroup.append('circle').attr('r', 8).attr('fill', 'rgba(245, 158, 11, 0.3)').attr('class', 'satellite-halo');
            satelliteGroup.append('circle').attr('r', 3).attr('fill', '#f59e0b');

            const orbitPath = svg.append("path")
                .attr("class", "orbit")
                .attr("fill", "none")
                .attr("stroke", "#f59e0b")
                .attr("stroke-width", 1.5)
                .attr("stroke-opacity", 0.8)
                .attr("stroke-dasharray", "4 4");

            // --- Animate Satellite Position & Orbit Path ---
            satrecTimerRef.current = d3.timer(() => {
                const now = new Date();

                // Animate Satellite Marker
                const posVel = satellite.propagate(satrec, now);
                const posEci = posVel.position as satellite.EciVec3<number>;
                if (!posEci) return;

                const gmst = satellite.gstime(now);
                const geodetic = satellite.eciToGeodetic(posEci, gmst);
                const lon = satellite.degreesLong(geodetic.longitude);
                const lat = satellite.degreesLat(geodetic.latitude);
                const coords = projection([lon, lat]);

                const visibilityTestPoint = projection.invert!(coords);
                const isVisible = d3.geoDistance([lon, lat], visibilityTestPoint) < 1e-6;

                satelliteGroup
                    .attr('transform', `translate(${coords[0]}, ${coords[1]})`)
                    .style('display', isVisible ? 'block' : 'none');

                // Draw dynamic orbit path (30 mins past, 90 mins future)
                const orbitPoints = [];
                const minutesInPast = 30;
                const minutesInFuture = 90;
                const stepMinutes = 2;

                for (let i = -minutesInPast; i <= minutesInFuture; i += stepMinutes) {
                    const time = new Date(now.getTime() + i * 60000);
                    const p = satellite.propagate(satrec, time);
                    const pEci = p.position as satellite.EciVec3<number>;
                    if (pEci) {
                        const pGmst = satellite.gstime(time);
                        const pGeo = satellite.eciToGeodetic(pEci, pGmst);
                        orbitPoints.push([satellite.degreesLong(pGeo.longitude), satellite.degreesLat(pGeo.latitude)]);
                    }
                }
                
                orbitPath.datum({ type: "LineString", coordinates: orbitPoints })
                         .attr("d", pathGenerator as any);
            });

            // --- Rotate Globe to Initial Satellite Position ---
            const initialPosVel = satellite.propagate(satrec, new Date());
            const initialPosEci = initialPosVel.position as satellite.EciVec3<number>;
            if (initialPosEci) {
                const gmst = satellite.gstime(new Date());
                const geodetic = satellite.eciToGeodetic(initialPosEci, gmst);
                const targetLon = satellite.degreesLong(geodetic.longitude);
                const targetLat = satellite.degreesLat(geodetic.latitude);
                
                if (rotationTimerRef.current) rotationTimerRef.current.stop();

                d3.transition("rotate-to-satellite").duration(1200)
                    .tween("rotate", () => {
                        const r = d3.interpolate(projection.rotate(), [-targetLon, -targetLat, 0]);
                        return (t) => {
                            projection.rotate(r(t) as [number, number, number]);
                            redrawAll();
                        };
                    })
                    .on("end", () => {
                        startIdleRotation(projection.rotate());
                    });
            } else {
                 startIdleRotation(projection.rotate());
            }
        } catch (e) {
            console.error("Failed to process TLE and visualize satellite:", e);
            startIdleRotation();
        }
    };

    const handleResize = () => {
      const { width, height } = container.getBoundingClientRect();
      svg.attr('width', width).attr('height', height);
      projection.scale(Math.min(width, height) / 2.2).translate([width / 2, height / 2]);
      redrawAll();
    };
    
    if (!worldDataRef.current) {
      d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
        .then(data => {
          worldDataRef.current = data;
          drawScene();
          updateSatelliteVisualization();
        })
        .catch(err => console.error("Error loading world data:", err));
    } else {
        drawScene();
        updateSatelliteVisualization();
    }
    
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (satrecTimerRef.current) satrecTimerRef.current.stop();
      if (rotationTimerRef.current) rotationTimerRef.current.stop();
    };

  }, [tleData]);

  return <svg ref={svgRef} className="cursor-grab active:cursor-grabbing w-full h-full" />;
};

export default OrbitVisualizer;