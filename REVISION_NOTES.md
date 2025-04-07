# SAM 2 專案程式碼修訂說明

本文件詳細記錄了對 [SAM 2 Demo 專案](./demo/) 所做的程式碼修改，包含重要的設定、環境和使用注意事項。

## 主要修改內容

### 1. API端點自動檢測

- 在 `SettingsReducer.ts` 中實作了自動檢測本地/遠端網絡並選擇適當 API 端點的機制
- 系統自動識別主機名稱是否為本地網絡，並選擇合適的 API 端點
- 支援多種本地網絡環境識別，包括 `localhost`、`127.0.0.1`、`.local` 域名以及私有IP範圍

### 2. 增加物件顏色與追蹤數量

- 在 `colors.ts` 中擴充了物件追蹤顏色列表，現在支援至少 15 種不同顏色
- 每種顏色都有對應的註解說明，使程式碼更易於維護和理解
- 將物件追蹤上限從預設 3 個修改為 9 個，使用者可同時追蹤更多物件
- 確保與 `demoObjectLimit` 的數量一致或更多，維持色彩分配的一致性

### 3. 影片處理與顯示改進

- 在 `setup.py` 中更新了 av 套件版本至 `13.0.0`，解決了 "Uh oh, we cannot process this video" 錯誤
- 修正影片下載播放問題，解決編碼相容性問題 [參見 PR #431](https://github.com/facebookresearch/sam2/pull/431#issue-2627021246)
- 修改影片處理邏輯，保留原始影片比例，不再強制調整為 16:9
- 去除預設浮水印，已修改為空字串，輸出更乾淨的結果
- 注意：未修正前的影片在 Windows 內建播放器可能無法播放，但 PotPlayer 正常；MATLAB 亦無法正常讀取畫格

### 4. 上傳限制調整

- 前端：`MAX_UPLOAD_FILE_SIZE` 從 70MB 大幅增加至 5000MB（5GB）
- 後端：`MAX_UPLOAD_VIDEO_DURATION` 從 10 秒增加至 180 秒（3分鐘）
- 更適合處理較長、較大的影片文件，但須留意實際硬體資源限制

### 5. 預設模型與容器設定

- 將預設模型 (MODEL_SIZE) 從 `base_plus` 更改為 `large`，提供更高精確度
- 在 `backend.Dockerfile` 中修正了 `ffmpeg` 路徑問題，通過刪除並重新鏈接到系統的 `ffmpeg`
- 強制重新安裝 `av套件` 以確保兼容性

## 環境設定注意事項

### 本地開發環境

- 使用 Windows Docker Containers 運行
- 若要在macOS上使用MPS加速，請按照原始 README 的說明在本地執行後端服務
- 設置環境變數 `SAM2_DEMO_FORCE_CPU_DEVICE=1` 可強制使用 CPU，避免 MPS 記憶體不足導致崩潰
- 使用 `localhost` 執行時可處理更大的檔案，但須考量設備性能限制，避免系統崩潰
- 建議對大型檔案先進行壓縮或降低解析度，以減輕硬體負擔

### Docker配置

在 `docker-compose.yaml` 中提供了完整的配置選項：

- 可調整的 `GUNICORN` 參數: `WORKERS`、`THREADS`、`PORT`
- 視頻編碼設定: 編解碼器、品質、FPS、尺寸
- GPU資源調度設定

### CloudFlare 整合與限制

專案已添加 CloudFlare 整合支援**供外網使用**，但需注意其檔案[上傳大小限制](https://developers.cloudflare.com/cache/concepts/default-cache-behavior/#upload-limits)：
- 免費計劃：100MB
- Pro 計劃：100MB
- Business 計劃：200MB
- Enterprise 計劃：500MB 或更高

若需處理更大檔案，建議考慮使用 [Cloudflare R2 儲存服務](https://developers.cloudflare.com/r2/)，並配置相應的資料存取邏輯。

### 建置與安裝

`setup.py` 支援以下安裝選項：

- 標準安裝: `pip install -e .`
- 交互式演示安裝: `pip install -e '.[interactive-demo]'`
- 開發環境安裝: `pip install -e '.[dev]'`

## 故障排除

1. 影片處理失敗：
   - 確保已正確安裝av套件 (版本 13.1.0)
   - 檢查 `ffmpeg` 是否可用於系統路徑 (https://github.com/Kosinkadink/ComfyUI-VideoHelperSuite/issues/69#issuecomment-1826764707)

2. MPS記憶體不足錯誤：
   - 設定環境變數 `SAM2_DEMO_FORCE_CPU_DEVICE=1`
   - 降低處理的影片解析度或長度

3. 物件追蹤限制：
   - 當前演示限制為 9 個物件，可以在 `./demo/frontend/src/demo/DemoConfig.tsx` 中修改 `demoObjectLimit`
   - 修改 `demoObjectLimit` 超過 9 個需額外增加 mask 色彩與修改[相應的程式檔案](./demo/frontend/src/common/components/video/effects)

## 雲端部署支援

專案已添加 CloudFlare 整合支援，可透過新增與設定 `dev-sam2
/.env` 檔案中的 `CLOUDFLARE_TUNNEL_TOKEN` 來使用 CloudFlare Tunnel 服務。

需修改相應檔案的 `API_URL` 如下：
- `./demo/frontend/src/demo/DemoConfig.tsx`
- `./docker-compose.yaml`


