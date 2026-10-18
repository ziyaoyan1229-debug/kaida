/*
 * 夜市地圖設定
 * googleMapsKey：Google Maps Platform 的瀏覽器金鑰（需啟用 Maps JavaScript API 與 Places API (New)）。
 *   這種金鑰本來就會出現在網頁裡，請務必在 Google Cloud 把它限制在本站網址（HTTP referrer）與這兩個 API。
 *   留空就使用 OpenStreetMap，不顯示店家與評論。
 * googleMapId：Google Cloud 建立的地圖 ID（選填，留空用 Google 的示範 ID）。
 * supabaseUrl / supabaseKey：網友投稿用的 Supabase 專案網址和 anon（publishable）金鑰。
 *   這把金鑰本來就是公開的，權限由 tools/supabase-setup.sql 設定。兩個都留空時，網站不顯示投稿功能。
 */
window.NM_CONFIG = {
  googleMapsKey: "AIzaSyA-lLrX12vIa9WcyMidGAdu5S1XQbzW72I",
  googleMapId: "",
  supabaseUrl: "",
  supabaseKey: ""
};
