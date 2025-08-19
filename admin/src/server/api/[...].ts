import { joinURL } from "ufo";

export default defineEventHandler(async (event) => {
  
  const config = useRuntimeConfig();
  const to = event.node.req.headers["to"];
  
  const proxyUrl = to ? to: config.apiUrl; 
  
  const path = event.path.replace(/^\/api\//, "api/");
  const target = joinURL(proxyUrl, path);
  
  return proxyRequest(event, target);
});
