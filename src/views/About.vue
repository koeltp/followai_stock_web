<template>
  <div class="about">
    <h2 class="section-title">关于我们</h2>
    <div class="about-content">
      <div class="about-section">
        <h3>公司简介</h3>
        <p>FollowAI是一家专注于股票投资分析的金融科技公司，致力于为投资者提供专业、全面的股票分析工具和服务。</p>
        <p>我们的团队由资深金融分析师和技术专家组成，拥有丰富的行业经验和专业知识，旨在通过科技创新为投资者创造更大的价值。</p>
      </div>
      <div class="about-section">
        <h3>我们的使命</h3>
        <p>通过技术创新和专业分析，帮助投资者做出更明智的投资决策，实现资产的长期增值。</p>
      </div>
      <div class="about-section">
        <h3>我们的服务</h3>
        <ul>
          <li>沪深300成分股分析</li>
          <li>单只股票深度分析</li>
          <li>投资组合优化建议</li>
          <li>市场趋势分析</li>
        </ul>
      </div>
      <div class="about-section">
        <h3>联系我们</h3>
        <p>contact@followai.top</p>
        <p>电话：400-123-4567</p>
        <p>地址：北京市朝阳区金融街88号</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 0;
}

.section-title {
  margin: 0 0 2rem 0;
  font-size: 2rem;
  font-weight: 600;
  color: #549c93;
  text-align: center;
}

.about-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.about-section {
  background: #f8f9fa;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.about-section h3 {
  margin: 0 0 1rem 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: #549c93;
}

.about-section p {
  margin: 0 0 1rem 0;
  line-height: 1.6;
  color: #666666;
}

.about-section ul {
  margin: 0;
  padding-left: 1.5rem;
}

.about-section li {
  margin: 0.5rem 0;
  color: #666666;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .about {
    padding: 1rem 0;
  }
  
  .section-title {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .about-content {
    gap: 1.5rem;
  }
  
  .about-section {
    padding: 1.5rem;
  }
  
  .about-section h3 {
    font-size: 1.1rem;
  }
  
  .about-section p {
    font-size: 0.9rem;
  }
  
  .about-section li {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .section-title {
    font-size: 1.3rem;
  }
  
  .about-section {
    padding: 1.2rem;
  }
  
  .about-section h3 {
    font-size: 1rem;
  }
  
  .about-section p {
    font-size: 0.85rem;
  }
  
  .about-section li {
    font-size: 0.85rem;
  }
}
</style>