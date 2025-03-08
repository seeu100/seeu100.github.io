// 解析Markdown格式的链接
// 监听文档加载完成事件
document.addEventListener('DOMContentLoaded', () => {
  /**
   * 异步加载并解析Markdown文件
   */
  const loadLinks = async () => {
    try {
      const response = await fetch('links.md');
      const text = await response.text();
      
      // 解析分类和链接
      const categories = parseMarkdown(text);

      // 渲染分类和链接
      renderLinks(categories);
    } catch (error) {
      console.error('加载链接失败:', error);
    }
  };

  // 初始化加载链接
  loadLinks();
});

function parseMarkdown(markdown) {
  const lines = markdown.split('\n');
  const categories = [];
  let currentCategory = null;
  let currentSubCategory = null;

  lines.forEach(line => {
    const trimmedLine = line.trim();
    
    if (line.startsWith('# ')) {
      // 主分类
      currentCategory = {
        title: line.substring(2).trim(),
        subCategories: [],
        links: []
      };
      currentSubCategory = null;
      categories.push(currentCategory);
    } else if (line.startsWith('- ') && !line.includes('](')) {
      // 二级分类
      currentSubCategory = {
        title: line.substring(2).trim(),
        links: []
      };
      if (currentCategory) {
        currentCategory.subCategories.push(currentSubCategory);
      }
    } else if (line.trim().startsWith('- [')) {
      // 二级分类下的链接
      const linkMatch = line.match(/\[(.*?)\]\((.*?)\)/);
      const iconMatch = line.match(/<!--\s*icon:(.*?)\s*-->/);
      if (linkMatch && currentSubCategory) {
        currentSubCategory.links.push({
          name: linkMatch[1],
          url: linkMatch[2],
          icon: iconMatch ? iconMatch[1] : null
        });
      }
    } else if (line.match(/^\[.*\]\(.*\)/)) {
      // 主分类下的链接
      const linkMatch = line.match(/\[(.*?)\]\((.*?)\)/);
      const iconMatch = line.match(/<!--\s*icon:(.*?)\s*-->/);
      if (linkMatch && currentCategory) {
        currentCategory.links.push({
          name: linkMatch[1],
          url: linkMatch[2],
          icon: iconMatch ? iconMatch[1] : null
        });
      }
    }
  });

  return categories;
}

function renderLinks(categories) {
  const defaultIcon = 'data:image/svg+xml;charset=utf-8;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHJ4PSI2IiBmaWxsPSIjZTBlMGUwIi8+PHBhdGggZD0iTTggNmg4djJIOFY2em0wIDRoOHYySDh2LTJ6bTAgNGg0djJIOHYtMnoiIGZpbGw9IiM5MDkwOTAiLz48L3N2Zz4=';
  
  const grid = document.getElementById('links-grid');
  
  // 清空现有内容
  grid.innerHTML = '';
  
  // 逐个创建元素
  categories.forEach(category => {
    const categorySection = document.createElement('div');
    categorySection.className = 'category-section';
    
    // 添加主分类标题
    const mainTitle = document.createElement('h2');
    mainTitle.textContent = category.title;
    categorySection.appendChild(mainTitle);
    
    // 添加主分类链接
    if (category.links.length > 0) {
      const mainGrid = document.createElement('div');
      mainGrid.className = 'grid-container';
      category.links.forEach(link => {
        mainGrid.appendChild(createLinkElement(link, defaultIcon));
      });
      categorySection.appendChild(mainGrid);
    }
    
    // 添加子分类
    category.subCategories.forEach(subCategory => {
      // 创建子分类标题（可点击的）
      const subTitle = document.createElement('h2');
      subTitle.className = 'category-title';
      subTitle.textContent = subCategory.title;
      
      // 创建子分类容器
      const subCategoryDiv = document.createElement('div');
      subCategoryDiv.className = 'sub-category';
      
      // 创建子分类的网格
      const subGrid = document.createElement('div');
      subGrid.className = 'grid-container';
      subCategory.links.forEach(link => {
        subGrid.appendChild(createLinkElement(link, defaultIcon));
      });
      
      subCategoryDiv.appendChild(subGrid);
      
      // 添加点击事件
      subTitle.addEventListener('click', () => {
        subTitle.classList.toggle('active');
        subCategoryDiv.classList.toggle('active');
      });
      
      // 将子分类添加到主分类中
      categorySection.appendChild(subTitle);
      categorySection.appendChild(subCategoryDiv);
    });
    
    grid.appendChild(categorySection);
  });

  // 图标加载优化
  loadIcons();
}

function createLinkElement(link, defaultIcon) {
  const linkCard = document.createElement('a');
  linkCard.href = link.url;
  linkCard.className = 'link-card';
  linkCard.target = '_blank';

  const img = document.createElement('img');
  img.src = defaultIcon;
  img.className = 'link-icon';
  img.dataset.src = link.icon || `${new URL(link.url).origin}/favicon.ico`;

  const span = document.createElement('span');
  span.textContent = link.name;

  linkCard.appendChild(img);
  linkCard.appendChild(span);

  return linkCard;
}

// 图标加载优化
function loadIcons() {
  const loadedIcons = new Set();
  document.querySelectorAll('.link-icon').forEach(img => {
    const iconUrl = img.dataset.src;
    if (iconUrl?.startsWith('http') && !loadedIcons.has(iconUrl)) {
      const tempImage = new Image();
      tempImage.onload = () => {
        img.src = iconUrl;
      };
      tempImage.onerror = () => {
        loadedIcons.add(iconUrl);
      };
      tempImage.src = iconUrl;
    }
  });
}