// Distância entre dois pontos (lat/lon) pela fórmula de Haversine.
// Retorna o resultado em metros.
const RAIO_TERRA = 6371000; // metros

function paraRadianos(graus: number) {
  return (graus * Math.PI) / 180;
}

export function distanciaMetros(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = paraRadianos(lat2 - lat1);
  const dLon = paraRadianos(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(paraRadianos(lat1)) * Math.cos(paraRadianos(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * RAIO_TERRA * Math.asin(Math.sqrt(a));
}
