<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const currentPath = ref('');

const runTimeDays = ref('00');
const runTimeHours = ref('00');
const runTimeMinutes = ref('00');
const runTimeSeconds = ref('00');
let timer = null;

const navigateTo = (path) => {
  router.push(path);
};

const updateCurrentPath = () => {
  currentPath.value = router.currentRoute.value.path;
};

const updateRunTime = () => {
  const now = new Date();
  const startDate = new Date('2026-03-15T15:00:00');
  const diff = now - startDate;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  runTimeDays.value = days.toString().padStart(2, '0');
  runTimeHours.value = hours.toString().padStart(2, '0');
  runTimeMinutes.value = minutes.toString().padStart(2, '0');
  runTimeSeconds.value = seconds.toString().padStart(2, '0');
};

onMounted(() => {
  updateCurrentPath();
  updateRunTime();
  timer = setInterval(() => {
    updateRunTime();
  }, 1000);
});

watch(() => router.currentRoute.value.path, () => {
  updateCurrentPath();
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});
</script>

<template>
  <div class="app">
    <header class="header">
      <div class="header-content">
        <img src="/logo.png" alt="FollowAI" class="site-logo" @click="navigateTo('/')" />
        <nav class="nav">
          <a class="nav-item" :class="{ active: currentPath === '/' }" @click="navigateTo('/')">
            首页
          </a>
          <a class="nav-item" :class="{ active: currentPath === '/analysis-history' }"
            @click="navigateTo('/analysis-history')">
            分析历史
          </a>
          <a class="nav-item" :class="{ active: currentPath === '/analysis-logs' }"
            @click="navigateTo('/analysis-logs')">
            分析日志
          </a>
          <a class="nav-item" :class="{ active: currentPath === '/config' }" @click="navigateTo('/config')">
            系统配置
          </a>
          <a class="nav-item" :class="{ active: currentPath === '/about' }" @click="navigateTo('/about')">
            关于我们
          </a>
        </nav>
      </div>
    </header>

    <main class="main-content">
      <router-view />
    </main>

    <footer class="footer">
      <div class="footer-content">
        <div class="footer-section">
          <p class="run-time">小破站已运行 <span class="time-days">{{ runTimeDays }}</span> 天 <span class="time-hours">{{
              runTimeHours }}</span> 时 <span class="time-minutes">{{ runTimeMinutes }}</span> 分 <span
              class="time-seconds">{{ runTimeSeconds }}</span> 秒</p>
        </div>
        <div class="footer-section">
          <p class="friend-links">
            友情链接：
            <a href="https://www.taipi.top" target="_blank" class="friend-link">TP投资</a> |
            <a href="https://www.jieleme.top/" target="_blank" class="friend-link">结了么</a> |
            <a href="https://nav.taipi.top/" target="_blank" class="friend-link">太皮导航</a> |
            <a href="https://tools.taipi.top" target="_blank" class="friend-link">太皮工具箱</a> |
            <a href="https://www.byteepoch.com" target="_blank" class="friend-link">字节时代</a>
          </p>
        </div>
        <div class="footer-section">
          <p class="disclaimer"><span class="copyright"> © 2026 FollowAI </span>本站分析仅供参考，不构成投资建议。投资有风险，入市需谨慎。</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

.header {
  background: #ffffff;
  color: #333333;
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

.site-logo {
  height: 40px;
  width: auto;
  object-fit: contain;
  cursor: pointer;
  vertical-align: middle;
}

.nav {
  display: flex;
  gap: 2rem;
}

.nav-item {
  color: #666666;
  text-decoration: none;
  font-size: 1rem;
  padding: 0.5rem 0;
  transition: all 0.3s ease;
  cursor: pointer;
  font-weight: 500;
  position: relative;
}

.nav-item:hover {
  color: #333333;
}

.nav-item.active {
  color: #549c93;
  font-weight: 600;
  position: relative;
  border-bottom: 2px solid #549c93;
}

.main-content {
  flex: 1;
  padding: 2rem;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

.footer {
  background: #1e293b;
  color: #94a3b8;
  padding: 2rem 0;
  margin-top: auto;
  border-top: 1px solid #334155;
}

.footer-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  text-align: center;
  padding: 0 2rem;
  width: 100%;
  box-sizing: border-box;
}

.footer-section {
  width: 100%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    padding: 0 1rem;
  }

  .nav {
    gap: 1rem;
  }

  .nav-item {
    font-size: 0.9rem;
  }

  .main-content {
    padding: 1rem;
  }

  .footer-content {
    padding: 0 1rem;
  }

  .friend-links {
    font-size: 0.8rem;
  }

  .friend-link {
    padding: 0 0.3rem;
  }

  .run-time {
    font-size: 0.8rem;
  }

  .disclaimer {
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .nav {
    width: 100%;
    justify-content: center;
  }

  .site-logo {
    height: 32px;
  }

  .friend-links {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
  }

  .friend-links::before {
    content: '友情链接：';
    display: block;
    width: 100%;
    margin-bottom: 0.5rem;
  }

  .friend-link {
    padding: 0.2rem 0.5rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
}

.copyright {
  margin: 0;
  font-size: 0.9rem;
  color: #549c93;
  font-weight: 500;
}

.run-time {
  margin: 0;
  font-size: 0.9rem;
  color: #cbd5e1;
  font-weight: 500;
}

.time-days {
  color: #ff6b6b;
  font-weight: 600;
}

.time-hours {
  color: #4ecdc4;
  font-weight: 600;
}

.time-minutes {
  color: #45b7d1;
  font-weight: 600;
}

.time-seconds {
  color: #96ceb4;
  font-weight: 600;
}

.friend-links {
  margin: 0;
  font-size: 0.9rem;
  color: #94a3b8;
}

.friend-link {
  color: #cbd5e1;
  text-decoration: none;
  transition: color 0.2s ease;
  padding: 0 0.5rem;
  font-weight: 500;
}

.friend-link:hover {
  color: #45b7d1;
  text-decoration: none;
}

.disclaimer {
  margin: 0;
  font-size: 0.85rem;
  color: #64748b;
  font-style: italic;
}
</style>
