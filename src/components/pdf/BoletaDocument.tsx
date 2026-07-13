import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import type { BoletaDetalleResponse } from '@/services/envioService';

// Estilos para el ticket térmico (aprox 80mm ancho = 226pt)
const styles = StyleSheet.create({
  page: {
    padding: 10,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#000',
  },
  header: {
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'dashed',
    paddingBottom: 5,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 8,
    marginBottom: 2,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  label: {
    width: '35%',
    fontWeight: 'bold',
  },
  value: {
    width: '65%',
    textAlign: 'right',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'dashed',
    marginVertical: 5,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#000',
  },
  totalText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 15,
    alignItems: 'center',
    textAlign: 'center',
  },
  footerText: {
    fontSize: 7,
    marginTop: 2,
  },
  bold: {
    fontWeight: 'bold',
  }
});

interface BoletaDocumentProps {
  data: BoletaDetalleResponse;
}

export const BoletaDocument = ({ data }: BoletaDocumentProps) => (
  <Document>
    <Page size={[226, 600]} style={styles.page}>
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>RAPIDO COURIER</Text>
        <Text style={styles.subtitle}>RUC: 20123456789</Text>
        <Text style={styles.subtitle}>Av. Principal 123 - Lima, Perú</Text>
        <Text style={{ marginTop: 4, fontWeight: 'bold' }}>COMPROBANTE DE ENVÍO</Text>
      </View>

      {/* Datos del Envío */}
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>ORDEN:</Text>
          <Text style={styles.value}>{data.numeroOrden}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>RASTREO:</Text>
          <Text style={styles.value}>{data.codigoRastreo}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>FECHA:</Text>
          <Text style={styles.value}>{new Date(data.fechaEmision).toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Remitente */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>REMITENTE</Text>
        <Text>{data.remitente.nombreCompleto}</Text>
        <View style={styles.row}>
          <Text>DNI: {data.remitente.dni}</Text>
          <Text>TEL: {data.remitente.telefono}</Text>
        </View>
        <Text style={{ fontSize: 7, marginTop: 2 }}>ORIGEN: {data.agenciaOrigen}</Text>
      </View>

      <View style={styles.divider} />

      {/* Destinatario */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DESTINATARIO</Text>
        <Text>{data.destinatario.nombreCompleto}</Text>
        <View style={styles.row}>
          <Text>DNI: {data.destinatario.dni}</Text>
          <Text>TEL: {data.destinatario.telefono}</Text>
        </View>
        <Text style={{ fontSize: 7, marginTop: 2 }}>DESTINO: {data.agenciaDestino}</Text>
      </View>

      <View style={styles.divider} />

      {/* Paquete */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PAQUETE</Text>
        <View style={styles.row}>
          <Text style={styles.label}>DESCRIPCIÓN:</Text>
          <Text style={styles.value}>{data.descripcionPaquete}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>PESO:</Text>
          <Text style={styles.value}>{data.pesoKg} Kg</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Totales */}
      <View style={styles.section}>
        <View style={styles.row}>
          <Text>ESTADO PAGO:</Text>
          <Text style={styles.bold}>{data.estadoPago}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalText}>TOTAL:</Text>
          <Text style={styles.totalText}>S/ {data.montoTotal.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.bold}>¡Gracias por confiar en nosotros!</Text>
        <Text style={styles.footerText}>Conserve este ticket para cualquier reclamo.</Text>
        <Text style={styles.footerText}>Rastree su paquete en:</Text>
        <Text style={styles.footerText}>www.rapidocourier.com</Text>
      </View>

    </Page>
  </Document>
);
