export const baseApi = (
  url: string,
  method: string = 'GET',
  query: { [key: string]: any } = {}
) => {
  const config = useRuntimeConfig();
  const uri = `${config.public.apiUrl}/api/${url}`;
  const cookie = useCookie('token');
  const token = cookie.value;
  return $fetch(uri, {
    method: method as
      | 'GET'
      | 'HEAD'
      | 'PATCH'
      | 'POST'
      | 'PUT'
      | 'DELETE'
      | 'CONNECT'
      | 'OPTIONS'
      | 'TRACE',
    headers: {
      Authorization: `Bearer ${token}`
    },
    query: method === 'GET' ? query : undefined,
    body: method === 'GET' ? undefined : query
  });
};