/**
 * Particle Effects System - 粒子效果系统
 */
class ParticleSystem {
  constructor(container) {
    this.container = container;
    this.particles = [];
    this.animationId = null;
  }

  /**
   * 创建判定反馈粒子
   */
  createJudgmentParticles(x, y, type = 'perfect') {
    const colors = {
      perfect: '#00ff88',
      good: '#ffff00',
      miss: '#ff0000'
    };

    const color = colors[type] || colors.perfect;
    const particleCount = type === 'perfect' ? 12 : 8;

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const velocity = 2 + Math.random() * 3;

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        life: 1,
        color,
        size: 3 + Math.random() * 4,
        type: 'judgment'
      });
    }
  }

  /**
   * 创建连击特效
   */
  createComboEffects(x, y, combo) {
    if (combo % 10 === 0) {
      // 每 10 连击触发特殊效果
      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const velocity = 3 + Math.random() * 4;

        this.particles.push({
          x,
          y,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          life: 1.2,
          color: '#ff00ff',
          size: 5 + Math.random() * 6,
          type: 'combo'
        });
      }

      // 添加文字特效
      this.createTextEffect(x, y, `+${combo}`, '#ff00ff');
    }
  }

  /**
   * 创建文字特效
   */
  createTextEffect(x, y, text, color) {
    const textEl = document.createElement('div');
    textEl.textContent = text;
    textEl.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      font-size: 24px;
      font-weight: bold;
      color: ${color};
      pointer-events: none;
      text-shadow: 0 0 10px ${color}80;
      animation: floatUp 1s ease-out forwards;
      z-index: 1000;
    `;

    this.container.appendChild(textEl);
    setTimeout(() => textEl.remove(), 1000);
  }

  /**
   * 创建音符击中动画
   */
  createNoteHitEffect(laneElement) {
    const rect = laneElement.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.bottom - 60;

    // 创建冲击波效果
    const wave = document.createElement('div');
    wave.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: 40px;
      height: 40px;
      border: 3px solid #00ff88;
      border-radius: 50%;
      pointer-events: none;
      animation: shockwave 0.6s ease-out forwards;
      z-index: 500;
    `;

    this.container.appendChild(wave);
    setTimeout(() => wave.remove(), 600);
  }

  /**
   * 更新粒子
   */
  update() {
    this.particles = this.particles.filter(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.1; // 重力
      particle.life -= 0.02;
      return particle.life > 0;
    });
  }

  /**
   * 渲染粒子到 Canvas
   */
  render(canvas, ctx) {
    this.particles.forEach(particle => {
      ctx.globalAlpha = particle.life;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  /**
   * 启动动画循环
   */
  startAnimation() {
    if (this.animationId) return;

    const animate = () => {
      this.update();
      this.animationId = requestAnimationFrame(animate);
    };

    this.animationId = requestAnimationFrame(animate);
  }

  /**
   * 停止动画
   */
  stopAnimation() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * 清空所有粒子
   */
  clear() {
    this.particles = [];
  }
}

export default ParticleSystem;
