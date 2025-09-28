/**
 * User login authentication via shared-imports API
 */
export async function userLogin(content, context) {
  const { userLogin } = await import('@whatsfresh/shared-imports');

  // content contains {url, body} but we only need body for the API
  return await userLogin(content.body);
}