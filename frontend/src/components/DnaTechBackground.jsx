import React, { useEffect, useRef } from 'react';

/**
 * DnaTechBackground: A high-performance, 3D rotating multicolor DNA double-helix
 * canvas animation with tech cyber particles and interactive mouse parallax.
 */
export default function DnaTechBackground({ 
  opacity = 0.85, 
  strandCount = 38,
  glow = true,
  interactive = true,
  diagonal = true,
  style = {}
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Mouse coordinates for 3D tilt & rotation
    const mouse = { x: width * 0.5, y: height * 0.5, targetX: width * 0.5, targetY: height * 0.5 };
    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Check dark vs light theme
    const isDark = () => document.documentElement.getAttribute('data-theme') === 'dark';

    // Multicolor Tech Palette: Cyan, Electric Violet, Magenta, Orange, Emerald, Gold
    const colors = [
      { r: 6, g: 182, b: 212 },   // Neon Cyan
      { r: 139, g: 92, b: 246 },  // Electric Violet
      { r: 236, g: 72, b: 153 },  // Magenta Pink
      { r: 249, g: 115, b: 22 },  // Flame Orange / Terracotta
      { r: 16, g: 185, b: 129 },  // Cyber Emerald
      { r: 245, g: 158, b: 11 }   // Amber Gold
    ];

    // Floating digital tech data particles (binary bits & glowing motes)
    const floatingBits = [];
    const bitCount = Math.min(Math.floor((width * height) / 24000), 45);
    for (let i = 0; i < bitCount; i++) {
      floatingBits.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2.2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.4 + 0.2,
        char: Math.random() > 0.6 ? (Math.random() > 0.5 ? '1' : '0') : null
      });
    }

    let rotationAngle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const dark = isDark();
      const masterAlpha = dark ? opacity : opacity * 0.75;

      // Smooth mouse lerp for 3D rotation tilt
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;
      const mouseTiltX = ((mouse.x / width) - 0.5) * 0.4;
      const mouseTiltY = ((mouse.y / height) - 0.5) * 0.3;

      rotationAngle += 0.015;

      // 1. Draw floating ambient cyber bits
      floatingBits.forEach(bit => {
        bit.x += bit.vx;
        bit.y += bit.vy;

        if (bit.x < 0) bit.x = width;
        else if (bit.x > width) bit.x = 0;
        if (bit.y < 0) bit.y = height;
        else if (bit.y > height) bit.y = 0;

        if (bit.char) {
          ctx.font = `${Math.floor(bit.size * 5 + 6)}px monospace`;
          ctx.fillStyle = `rgba(${bit.color.r}, ${bit.color.g}, ${bit.color.b}, ${bit.alpha * masterAlpha})`;
          ctx.fillText(bit.char, bit.x, bit.y);
        } else {
          ctx.beginPath();
          ctx.arc(bit.x, bit.y, bit.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${bit.color.r}, ${bit.color.g}, ${bit.color.b}, ${bit.alpha * masterAlpha})`;
          ctx.fill();
        }
      });

      // 2. DNA Helix Model Parameters
      // Can render diagonal or vertical across screen
      const centerX = width * 0.5 + mouseTiltX * 80;
      const centerY = height * 0.5 + mouseTiltY * 60;
      const helixRadius = Math.min(width * 0.28, 220); // Width of the helix
      const totalSteps = Math.max(strandCount, Math.floor(height / 28));
      const verticalSpan = height * 1.2;
      const startY = centerY - verticalSpan * 0.5;
      const stepY = verticalSpan / totalSteps;

      // Angle per vertical step to create the spiraling turns
      const pitch = 0.22;

      // Collect elements to sort by depth (Z-buffer for authentic 3D occlusion)
      const renderElements = [];

      for (let i = 0; i < totalSteps; i++) {
        const progress = i / totalSteps;
        const currentY = startY + i * stepY;

        // Diagonal offset if diagonal mode enabled
        const diagOffset = diagonal ? (progress - 0.5) * (width * 0.45) : 0;
        const strandCenterX = centerX + diagOffset;

        // Current rotation angle for this step
        const angle = rotationAngle + (i * pitch);

        // 3D coordinates for Strand A
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle); // Z depth (-1 back to +1 front)
        const xA = strandCenterX + cosA * helixRadius;
        const zA = sinA; 

        // 3D coordinates for Strand B (phase shifted by Math.PI / 180 degrees)
        const cosB = Math.cos(angle + Math.PI);
        const sinB = Math.sin(angle + Math.PI);
        const xB = strandCenterX + cosB * helixRadius;
        const zB = sinB;

        // Color indices that shift smoothly along the helix length
        const colorIdxA = Math.floor((i + Math.floor(rotationAngle * 2)) % colors.length);
        const colorIdxB = (colorIdxA + 3) % colors.length;
        const colA = colors[colorIdxA];
        const colB = colors[colorIdxB];

        // Store rung and nodes for Z-sorting
        renderElements.push({
          type: 'rung',
          z: (zA + zB) * 0.5,
          x1: xA,
          y1: currentY,
          x2: xB,
          y2: currentY,
          colA,
          colB,
          zA,
          zB
        });

        renderElements.push({
          type: 'node',
          z: zA,
          x: xA,
          y: currentY,
          color: colA,
          strand: 'A'
        });

        renderElements.push({
          type: 'node',
          z: zB,
          x: xB,
          y: currentY,
          color: colB,
          strand: 'B'
        });
      }

      // Sort elements by depth: render far objects first, near objects in front
      renderElements.sort((a, b) => a.z - b.z);

      // Render sorted 3D elements
      renderElements.forEach(item => {
        if (item.type === 'rung') {
          // Cross-rung connection between the two strands (base pair)
          const depthNorm = (item.z + 1) * 0.5; // 0 (far) to 1 (near)
          const rungAlpha = (0.15 + depthNorm * 0.45) * masterAlpha;

          // Gradient across the rung linking both colors
          const rungGrad = ctx.createLinearGradient(item.x1, item.y1, item.x2, item.y2);
          rungGrad.addColorStop(0, `rgba(${item.colA.r}, ${item.colA.g}, ${item.colA.b}, ${rungAlpha})`);
          rungGrad.addColorStop(0.5, `rgba(255, 255, 255, ${rungAlpha * 0.8})`);
          rungGrad.addColorStop(1, `rgba(${item.colB.r}, ${item.colB.g}, ${item.colB.b}, ${rungAlpha})`);

          ctx.beginPath();
          ctx.moveTo(item.x1, item.y1);
          ctx.lineTo(item.x2, item.y2);
          ctx.strokeStyle = rungGrad;
          ctx.lineWidth = 1 + depthNorm * 1.6;
          ctx.stroke();

          // Small midpoint nucleotide connector dot
          const midX = (item.x1 + item.x2) * 0.5;
          const midY = (item.y1 + item.y2) * 0.5;
          ctx.beginPath();
          ctx.arc(midX, midY, 1.4 + depthNorm * 1.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${rungAlpha * 1.2})`;
          ctx.fill();

        } else if (item.type === 'node') {
          // Strand node (phosphate backbone sphere)
          const depthNorm = (item.z + 1) * 0.5; // 0 to 1
          const nodeRadius = 2.5 + depthNorm * 4.5; // Bigger when closer to screen
          const nodeAlpha = (0.25 + depthNorm * 0.75) * masterAlpha;
          const { r, g, b } = item.color;

          // Outer tech glow halo when in front
          if (glow && depthNorm > 0.4) {
            ctx.beginPath();
            ctx.arc(item.x, item.y, nodeRadius * 2.4, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${nodeAlpha * 0.22})`;
            ctx.fill();
          }

          // Main glowing node
          ctx.beginPath();
          ctx.arc(item.x, item.y, nodeRadius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${nodeAlpha})`;
          ctx.fill();

          // High-contrast bright cyber nucleus core
          if (depthNorm > 0.3) {
            ctx.beginPath();
            ctx.arc(item.x, item.y, nodeRadius * 0.45, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${nodeAlpha * 0.9})`;
            ctx.fill();
          }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [opacity, strandCount, glow, interactive, diagonal]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        ...style
      }}
    />
  );
}
