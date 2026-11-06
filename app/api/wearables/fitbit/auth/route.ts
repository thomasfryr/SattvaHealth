import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const clientId = process.env.FITBIT_CLIENT_ID;
  const redirectUri =
    process.env.NEXT_PUBLIC_FITBIT_REDIRECT_URI ||
    `${new URL(request.url).origin}/api/wearables/fitbit/callback`;

  if (!clientId) {
    return NextResponse.json({
      configured: false,
      message:
        "Credenciales FITBIT_CLIENT_ID no encontradas en .env.local. Activando sincronización con motor de telemetría Paciente 0.",
      demoSyncReady: true,
    });
  }

  const scope = encodeURIComponent(
    "activity heartrate respiratory_rate oxygen_saturation sleep temperature profile"
  );
  const authUrl = `https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${scope}&expires_in=604800`;

  return NextResponse.json({
    configured: true,
    authUrl,
  });
}
