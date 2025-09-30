export const API_BASE_URL = "http://localhost/usuarios"; // Para desarrollo local


//export const API_BASE_URL = "http://localhost/usuarios"; // Para desarrollo local
// export const API_BASE_URL = "http://ec2-34-202-72-75.compute-1.amazonaws.com/phpmyadmin"; // Para producción
//       "http://ec2-34-202-72-75.compute-1.amazonaws.com/phpmyadmin/usuarios.php?login=true",
declare global {
  interface Window {
    API_BASE_URL: string;
  }
}
