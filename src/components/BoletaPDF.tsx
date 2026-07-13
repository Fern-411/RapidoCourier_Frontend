import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
    borderBottomStyle: 'solid',
    paddingBottom: 10,
    marginBottom: 20,
  },
  brandName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  companyInfo: {
    textAlign: 'right',
    color: '#666',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
    textTransform: 'uppercase',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    width: 120,
    fontWeight: 'bold',
    color: '#4b5563',
  },
  value: {
    flex: 1,
    color: '#111827',
  },
  trackingCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563eb',
    marginTop: 5,
    textAlign: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 8,
    backgroundColor: '#eff6ff',
  },
  totalSection: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 20,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  }
});

interface BoletaPDFProps {
  data: any; // boleta-datos
  montoPago: number;
  montoRecibido?: number;
}

export const BoletaPDF = ({ data, montoPago, montoRecibido }: BoletaPDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.brandName}>RÁPIDO COURIER</Text>
          <Text>Envíos Rápidos y Seguros a Nivel Nacional</Text>
        </View>
        <View style={styles.companyInfo}>
          <Text>RUC: 20123456789</Text>
          <Text>Av. Central 123, Lima - Perú</Text>
          <Text>contacto@rapidocourier.com</Text>
        </View>
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.title}>BOLETA DE VENTA ELECTRÓNICA</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Datos del Envío</Text>
        <View style={styles.row}>
          <Text style={styles.label}>N° de Orden:</Text>
          <Text style={styles.value}>{data?.numeroOrden || '---'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Fecha Emisión:</Text>
          <Text style={styles.value}>{new Date().toLocaleString()}</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', marginBottom: 20 }}>
        <View style={{ flex: 1, paddingRight: 10 }}>
          <Text style={styles.sectionTitle}>Remitente</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nombre:</Text>
            <Text style={styles.value}>{data?.remitente?.nombreCompleto || '---'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>DNI/Doc:</Text>
            <Text style={styles.value}>{data?.remitente?.dni || '---'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Agencia Origen:</Text>
            <Text style={styles.value}>{data?.agenciaOrigen || '---'}</Text>
          </View>
        </View>

        <View style={{ flex: 1, paddingLeft: 10 }}>
          <Text style={styles.sectionTitle}>Destinatario</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nombre:</Text>
            <Text style={styles.value}>{data?.destinatario?.nombreCompleto || '---'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>DNI/Doc:</Text>
            <Text style={styles.value}>{data?.destinatario?.dni || '---'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Agencia Destino:</Text>
            <Text style={styles.value}>{data?.agenciaDestino || '---'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detalles del Paquete</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Descripción:</Text>
          <Text style={styles.value}>{data?.descripcionPaquete || '---'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Peso (Kg):</Text>
          <Text style={styles.value}>{data?.pesoKg || '---'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Código de Rastreo</Text>
        <Text style={styles.trackingCode}>{data?.codigoRastreo || '---'}</Text>
        <Text style={{ textAlign: 'center', marginTop: 5, color: '#666', fontSize: 9 }}>
          Use este código en nuestro portal web para rastrear el estado de su envío.
        </Text>
      </View>

      <View style={styles.totalSection}>
        <View style={styles.row}>
          <Text style={styles.totalLabel}>TOTAL A PAGAR:</Text>
          <Text style={styles.totalAmount}>S/ {montoPago.toFixed(2)}</Text>
        </View>
        
        {montoRecibido && montoRecibido >= montoPago && (
          <>
            <View style={styles.row}>
              <Text style={styles.label}>Efectivo Recibido:</Text>
              <Text style={{ ...styles.value, textAlign: 'right' }}>S/ {montoRecibido.toFixed(2)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={{ ...styles.label, fontWeight: 'bold' }}>Vuelto:</Text>
              <Text style={{ ...styles.value, textAlign: 'right', fontWeight: 'bold' }}>S/ {(montoRecibido - montoPago).toFixed(2)}</Text>
            </View>
          </>
        )}
      </View>

      <Text style={styles.footer}>
        Esta es una representación impresa de la Boleta de Venta Electrónica. 
        Generada por Rápido Courier App. 
        Gracias por su preferencia.
      </Text>
    </Page>
  </Document>
);
