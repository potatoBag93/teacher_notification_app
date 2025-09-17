import type { EditBlock } from '../data/edit'

export interface PreviewOptions {
  blocks: EditBlock[]
  formattedDate: string
  selectedFormat: 'simple' | 'numbered' | 'bullet'
  elementVisibility: {
    header: boolean
    content: boolean
    subItems: boolean
  }
}

export function openNewWindowPreview(options: PreviewOptions) {
  const previewWindow = window.open(
    '', 
    '_blank', 
    `width=${screen.availWidth},height=${screen.availHeight},scrollbars=yes,resizable=yes`
  )
  
  if (previewWindow) {
    const previewContent = generatePreviewHTML(options)
    previewWindow.document.write(previewContent)
    previewWindow.document.close()
    previewWindow.focus()
    previewWindow.moveTo(0, 0)
    previewWindow.resizeTo(screen.availWidth, screen.availHeight)
  }
}

function generatePreviewHTML(options: PreviewOptions): string {
  const { blocks, formattedDate, selectedFormat, elementVisibility } = options
  
  let contentHTML = ''
  
  if (blocks.length === 0) {
    contentHTML = `
      <div class="empty-state">
        <div class="empty-icon">📝</div>
        <p class="empty-text">편집할 문구를 추가해주세요</p>
        <p class="empty-subtext">왼쪽에서 문구를 선택하거나 새로 작성하세요</p>
      </div>
    `
  } else {
    contentHTML = '<div class="notice-body">'
    
    // 블록을 order로 정렬
    const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order)
    
    sortedBlocks.forEach((block, index) => {
      contentHTML += '<div class="notice-item">'
      
      // 제목
      if (elementVisibility.header && block.title && block.title.trim()) {
        contentHTML += '<div class="item-header">'
        contentHTML += '<h4 class="item-title">'
        if (selectedFormat === 'numbered') {
          contentHTML += `<span class="item-number">${index + 1}.</span>`
        }
        contentHTML += `${block.title}`
        contentHTML += '</h4></div>'
      }
      
      // 내용
      if (elementVisibility.content && block.content && block.content.trim()) {
        contentHTML += `<p class="item-content">${block.content}</p>`
      }
      
      // 하위 목록
      if (elementVisibility.subItems && block.subItems && block.subItems.length > 0) {
        contentHTML += '<ul class="item-sub-list">'
        block.subItems.forEach(subItem => {
          const bullet = selectedFormat === 'bullet' ? '•' : '-'
          contentHTML += `<li class="item-sub-item"><span class="bullet">${bullet}</span> ${subItem}</li>`
        })
        contentHTML += '</ul>'
      }
      
      contentHTML += '</div>'
    })
    
    contentHTML += '</div>'
  }

  return `
    <!DOCTYPE html>
    <html lang="ko">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>알림장 미리보기</title>
        <style>
          ${getPreviewStyles()}
        </style>
        <script>
          ${getPreviewScript()}
        </script>
      </head>
      <body>
        <div class="zoom-controls">
          <button onclick="changeZoom(-0.1)" class="zoom-btn">🔍➖</button>
          <span id="zoom-level">100%</span>
          <button onclick="changeZoom(0.1)" class="zoom-btn">🔍➕</button>
          <button onclick="resetZoom()" class="zoom-btn">↻ 초기화</button>
        </div>
        <div id="content-area">
          <div class="notice-header">
            <h2 class="notice-date">${formattedDate}</h2>
            <div class="block-count">${blocks.length}개 항목</div>
          </div>
          ${contentHTML}
        </div>
      </body>
    </html>
  `
}

function getPreviewStyles(): string {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body { 
      font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0f3f3f;
      color: #ffffff;
      line-height: 1.4;
      padding: 0;
      min-height: 100vh;
      margin: 0;
      width: 100%;
    }
    
    .zoom-controls {
      position: fixed;
      top: 1rem;
      right: 1rem;
      background: rgba(74, 222, 128, 0.9);
      padding: 0.5rem;
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      z-index: 1000;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }
    
    .zoom-btn {
      background: #059669;
      color: white;
      border: none;
      padding: 0.3rem 0.6rem;
      border-radius: 0.25rem;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      transition: background-color 0.2s;
    }
    
    .zoom-btn:hover {
      background: #047857;
    }
    
    .zoom-btn:active {
      transform: scale(0.95);
    }
    
    #zoom-level {
      background: #065f46;
      color: white;
      padding: 0.3rem 0.6rem;
      border-radius: 0.25rem;
      font-size: 0.9rem;
      font-weight: 600;
      min-width: 50px;
      text-align: center;
    }
    
    #content-area {
      padding: 1rem 0.5rem;
      transition: font-size 0.3s ease;
    }
    
    .notice-header { 
      text-align: center; 
      margin-bottom: 1.5rem; 
      padding-bottom: 1rem; 
      border-bottom: 2px solid #4ade80;
    }
    
    .notice-date {
      font-size: 1.8rem;
      font-weight: 800;
      color: #4ade80;
      margin-bottom: 0.3rem;
    }
    
    .block-count {
      color: #a7f3d0;
      font-size: 0.9rem;
      font-weight: 400;
    }
    
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #a7f3d0;
    }
    
    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1.5rem;
    }
    
    .empty-text {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: #ffffff;
    }
    
    .empty-subtext {
      font-size: 1.1rem;
      color: #a7f3d0;
    }
    
    .notice-body {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    
    .notice-item {
      margin-bottom: 1rem;
    }
    
    .item-header {
      margin-bottom: 0.5rem;
    }
    
    .item-title {
      font-size: 1.4rem;
      font-weight: 700;
      color: #4ade80;
      line-height: 1.2;
      margin-bottom: 0.3rem;
    }
    
    .item-number {
      color: #34d399;
      margin-right: 0.5rem;
      font-weight: 800;
    }
    
    .item-content {
      color: #ffffff;
      font-size: 1rem;
      font-weight: 400;
      line-height: 1.4;
      margin-bottom: 0.5rem;
      margin-left: 0.5rem;
    }
    
    .item-sub-list {
      list-style: none;
      margin-left: 1rem;
      margin-top: 0.5rem;
    }
    
    .item-sub-item {
      color: #a7f3d0;
      font-size: 0.9rem;
      font-weight: 500;
      line-height: 1.3;
      margin-bottom: 0.3rem;
      display: flex;
      align-items: flex-start;
    }
    
    .item-sub-item:last-child {
      margin-bottom: 0;
    }
    
    .bullet {
      color: #34d399;
      font-weight: 600;
      margin-right: 0.5rem;
      font-size: 1rem;
      flex-shrink: 0;
    }
    
    @media (max-width: 768px) {
      #content-area {
        padding: 0.5rem 0.25rem;
      }
      
      .notice-date {
        font-size: 1.5rem;
      }
      
      .item-title {
        font-size: 1.2rem;
      }
      
      .item-content {
        font-size: 0.9rem;
      }
      
      .item-sub-item {
        font-size: 0.8rem;
      }
    }
    
    @media print {
      .zoom-controls {
        display: none;
      }
      
      #content-area {
        background: white;
        color: black;
        padding: 1rem 0.5rem;
      }
      
      .notice-header {
        border-bottom-color: #333;
      }
      
      .notice-date {
        color: #333;
      }
      
      .block-count {
        color: #666;
      }
      
      .item-title {
        color: #333;
      }
      
      .item-content {
        color: #333;
      }
      
      .item-sub-item {
        color: #555;
      }
      
      .bullet {
        color: #333;
      }
    }
  `
}

function getPreviewScript(): string {
  return `
    let currentZoom = 1.0;
    
    function changeZoom(delta) {
      currentZoom = Math.max(0.5, Math.min(3.0, currentZoom + delta));
      updateZoom();
    }
    
    function resetZoom() {
      currentZoom = 1.0;
      updateZoom();
    }
    
    function updateZoom() {
      const contentArea = document.getElementById('content-area');
      contentArea.style.fontSize = (currentZoom * 100) + '%';
      document.getElementById('zoom-level').textContent = Math.round(currentZoom * 100) + '%';
    }
    
    document.addEventListener('keydown', function(e) {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          changeZoom(0.1);
        } else if (e.key === '-') {
          e.preventDefault();
          changeZoom(-0.1);
        } else if (e.key === '0') {
          e.preventDefault();
          resetZoom();
        }
      }
    });
  `
}
