export const baseApi = (
  url: string,
  method: string = 'GET',
  query: { [key: string]: any } = {}
) => {
  const uri = `/api/${url}`;

  console.log(uri);

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
