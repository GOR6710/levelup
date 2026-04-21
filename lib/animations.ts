// 动画工具函数
export const animations = {
  // 弹跳动画
  bounce: (element: HTMLElement, duration: number = 500) => {
    element.style.animation = `bounce ${duration}ms ease-in-out`
    setTimeout(() => {
      element.style.animation = ''
    }, duration)
  },

  // 淡入动画
  fadeIn: (element: HTMLElement, duration: number = 300) => {
    element.style.opacity = '0'
    element.style.transition = `opacity ${duration}ms ease-in-out`
    requestAnimationFrame(() => {
      element.style.opacity = '1'
    })
  },

  // 滑入动画
  slideIn: (element: HTMLElement, direction: 'left' | 'right' | 'up' | 'down' = 'up', duration: number = 300) => {
    const transforms = {
      left: 'translateX(-100%)',
      right: 'translateX(100%)',
      up: 'translateY(100%)',
      down: 'translateY(-100%)'
    }
    
    element.style.transform = transforms[direction]
    element.style.transition = `transform ${duration}ms ease-out`
    requestAnimationFrame(() => {
      element.style.transform = 'translate(0, 0)'
    })
  },

  // 脉冲动画
  pulse: (element: HTMLElement, duration: number = 1000) => {
    element.style.animation = `pulse ${duration}ms ease-in-out infinite`
  },

  // 摇晃动画（错误提示）
  shake: (element: HTMLElement, duration: number = 500) => {
    element.style.animation = `shake ${duration}ms ease-in-out`
    setTimeout(() => {
      element.style.animation = ''
    }, duration)
  },

  // 数字滚动动画
  countUp: (element: HTMLElement, target: number, duration: number = 1000) => {
    const start = parseInt(element.textContent || '0')
    const increment = target - start
    const startTime = performance.now()
    
    const update = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const current = Math.floor(start + increment * easeOutQuart)
      
      element.textContent = current.toString()
      
      if (progress < 1) {
        requestAnimationFrame(update)
      }
    }
    
    requestAnimationFrame(update)
  },

  // XP 获得动画
  xpGain: (element: HTMLElement, xp: number) => {
    const xpElement = document.createElement('div')
    xpElement.textContent = `+${xp} XP`
    xpElement.style.cssText = `
      position: fixed;
      color: #00ffff;
      font-weight: bold;
      font-size: 1.5rem;
      pointer-events: none;
      z-index: 9999;
      animation: xpFloat 1.5s ease-out forwards;
    `
    
    const rect = element.getBoundingClientRect()
    xpElement.style.left = `${rect.left + rect.width / 2}px`
    xpElement.style.top = `${rect.top}px`
    
    document.body.appendChild(xpElement)
    
    setTimeout(() => {
      xpElement.remove()
    }, 1500)
  }
}

// CSS 动画关键帧（需要在全局 CSS 中定义）
export const animationKeyframes = `
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

@keyframes xpFloat {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-100px) scale(1.5);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-bounce-custom {
  animation: bounce 0.5s ease-in-out;
}

.animate-pulse-custom {
  animation: pulse 1s ease-in-out infinite;
}

.animate-shake {
  animation: shake 0.5s ease-in-out;
}

.animate-slide-in-up {
  animation: slideInUp 0.3s ease-out;
}

.animate-fade-in-scale {
  animation: fadeInScale 0.3s ease-out;
}
`
