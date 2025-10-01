/**
 * User login authentication via shared-imports API
 */
export async function userLogin(content, context) {
  const { userLogin } = await import('@whatsfresh/shared-imports');

  // Map form fields to API expectations
  // Form uses 'enteredPassword' to avoid browser autocomplete issues
  // API expects 'password'
  const loginData = {
    userEmail: context.formData.userEmail,
    password: context.formData.enteredPassword
  };

  console.log('🔐 userLogin - mapped data:', loginData);
  return await userLogin(loginData);
}