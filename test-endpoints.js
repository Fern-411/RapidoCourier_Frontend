const API_URL = "http://localhost:8080/api/v1";
let authCookies = "";

async function fetchAPI(endpoint, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(authCookies && { Cookie: authCookies }),
    ...options.headers,
  };
  
  const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  
  const setCookie = response.headers.get("set-cookie");
  if (setCookie) {
    let cookiesToSet = [];
    if (response.headers.getSetCookie) {
      cookiesToSet = response.headers.getSetCookie();
    } else {
      cookiesToSet = [setCookie];
    }
    const parsedCookies = cookiesToSet.map(c => c.split(';')[0]);
    if (authCookies) {
      authCookies = authCookies + "; " + parsedCookies.join("; ");
    } else {
      authCookies = parsedCookies.join("; ");
    }
  }

  const data = await response.json().catch(() => null);
  
  if (!response.ok) {
    throw new Error(`API Error [${response.status}] ${endpoint}: ${data ? JSON.stringify(data) : response.statusText}`);
  }
  return data;
}

async function runTests() {
  console.log("🚀 Iniciando prueba de todos los endpoints...\n");

  try {
    console.log("1️⃣  Testeando POST /auth/login");
    const loginRes = await fetchAPI("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "admin@rapidocourier.com", password: "admin123" })
    });
    console.log("✅ Login exitoso. Cookies obtenidas.\n");

    const docTest = "99" + String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
    const docDest = "77" + String(Math.floor(Math.random() * 1000000)).padStart(6, '0');

    const remitenteData = {
      nombre: "Test Remitente",
      apellido: "Pérez",
      dni: docTest,
      telefono: "999888777",
      email: `test${docTest}@rapido.com`
    };

    const destinatarioData = {
      nombre: "Test Destinatario",
      apellido: "Gómez",
      dni: docDest,
      telefono: "999111222",
      email: `test${docDest}@rapido.com`
    };

    console.log("2️⃣  Testeando POST /clientes (Remitente)");
    let remitente = await fetchAPI("/clientes", {
      method: "POST",
      body: JSON.stringify(remitenteData)
    }).catch(async (e) => {
      console.log(`⚠️  Error creando remitente: ${e.message}, buscando...`);
      return fetchAPI(`/clientes/dni/${docTest}`);
    });
    remitente = remitente.data || remitente;
    console.log(`✅ Remitente OK: ${remitente.id}\n`);

    console.log("3️⃣  Testeando POST /clientes (Destinatario)");
    let destinatario = await fetchAPI("/clientes", {
      method: "POST",
      body: JSON.stringify(destinatarioData)
    }).catch(async (e) => {
      console.log(`⚠️  Error creando destinatario: ${e.message}, buscando...`);
      return fetchAPI(`/clientes/dni/${docDest}`);
    });
    destinatario = destinatario.data || destinatario;
    console.log(`✅ Destinatario OK: ${destinatario.id}\n`);

    console.log("4️⃣  Obteniendo/Creando Agencias");
    let agenciasRes = await fetchAPI("/agencias");
    let agencias = agenciasRes.data || [];
    if (agencias.length < 2) {
      console.log("⚠️ Creando agencias de prueba...");
      await fetchAPI("/agencias", { method: "POST", body: JSON.stringify({ nombre: "Agencia Lima", direccion: "Lima Centro" }) });
      await fetchAPI("/agencias", { method: "POST", body: JSON.stringify({ nombre: "Agencia Trujillo", direccion: "Trujillo" }) });
      agenciasRes = await fetchAPI("/agencias");
      agencias = agenciasRes.data;
    }
    console.log(`✅ Agencias OK. Origen: ${agencias[0].id}, Destino: ${agencias[1].id}\n`);

    console.log("5️⃣  Testeando POST /paquetes");
    const paqueteRes = await fetchAPI("/paquetes", {
      method: "POST",
      body: JSON.stringify({
        dniRemitente: docTest,
        dniDestinatario: docDest,
        pesoKg: 5.5,
        valorDeclarado: 100.0,
        altoCm: 10.0,
        anchoCm: 15.0,
        largoCm: 20.0,
        categorias: ["DOCUMENTOS"]
      })
    });
    const paquete = paqueteRes.data;
    console.log(`✅ Paquete creado:`, JSON.stringify(paquete));

    console.log("6️⃣  Testeando POST /envios");
    const envioRes = await fetchAPI("/envios", {
      method: "POST",
      body: JSON.stringify({
        paqueteId: paquete.id,
        agenciaOrigenId: agencias[0].id,
        agenciaDestinoId: agencias[1].id,
        claveRecojo: "123456"
      })
    });
    const envio = envioRes.data;
    console.log(`✅ Envío creado: ${envio.id} | Orden: ${envio.numeroOrden} | Rastreo: ${envio.codigoRastreo}\n`);

    console.log("7️⃣  Testeando POST /pagos/procesar");
    const pagoRes = await fetchAPI("/pagos/procesar", {
      method: "POST",
      body: JSON.stringify({
        paqueteId: paquete.id,
        metodoPago: "EFECTIVO",
        monto: 25.0
      })
    });
    console.log(`✅ Pago procesado exitosamente.\n`);

    console.log("8️⃣  Testeando GET /envios/rastreo (Ruta Pública)");
    const rastreoRes = await fetchAPI(`/envios/rastreo/${envio.numeroOrden}/${envio.codigoRastreo}`);
    console.log(`✅ Rastreo exitoso: Estado Actual = ${rastreoRes.data.estadoActual}\n`);

    console.log("9️⃣  Testeando GET /envios/{id}/historial (Ruta Pública)");
    const historialRes = await fetchAPI(`/envios/${envio.id}/historial`);
    console.log(`✅ Historial obtenido. Movimientos = ${historialRes.data.length}\n`);

    console.log("🔟  Testeando GET /envios/estadisticas/resumen-diario");
    const estadisticasRes = await fetchAPI("/envios/estadisticas/resumen-diario");
    console.log(`✅ Estadísticas obtenidas. Datos: ${JSON.stringify(estadisticasRes.data)}\n`);

    console.log("🎉 ¡Todos los endpoints funcionan correctamente! 🎉");

  } catch (error) {
    console.error("❌ Falló la prueba:", error.message);
  }
}

runTests();
