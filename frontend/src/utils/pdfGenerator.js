import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import autoTable from 'jspdf-autotable';

// =====================================================
// CONSTANTES DE DISEÑO CORPORATIVO
// =====================================================
const DESIGN = {
  // Colores corporativos (RGB)
  COLORS: {
    INDIGO_DARK: [67, 56, 202],    // #4338ca - Header principal
    INDIGO: [79, 70, 229],         // #4f46e5 - Tabla header
    GRAY_DARK: [75, 85, 99],       // #4b5563 - Texto secundario
    GRAY_TEXT: [50, 50, 50],       // #323232 - Texto tabla
    GRAY_LIGHT: [243, 244, 246],   // #f3f4f6 - Filas alternadas
    WHITE: [255, 255, 255],
    BLACK: [0, 0, 0]
  },
  
  // Márgenes y espaciado
  MARGINS: {
    PAGE: 15,           // mm - Margen general de página
    HEADER_HEIGHT: 30,  // mm - Alto del header
    SECTION_GAP: 10,    // mm - Espacio entre secciones
    LINE_HEIGHT: 5      // mm - Alto de línea de texto
  },
  
  // Tipografía
  FONTS: {
    FAMILY: 'helvetica',
    SIZES: {
      TITLE: 18,
      SUBTITLE: 10,
      SECTION: 12,
      BODY: 9,
      FOOTER: 7
    }
  }
};

/**
 * Genera un reporte PDF profesional con diseño corporativo impecable
 * @param {Object} params - Parámetros del reporte
 * @param {string} params.especie - Especie analizada
 * @param {Object} params.estadisticas - Estadísticas calculadas
 * @param {Array} params.data - Datos anuales de trazabilidad
 * @param {string} params.region - Región analizada
 * @param {HTMLElement} params.chartContainer - Contenedor de gráficos a capturar
 */
export const generateTrazabilidadPDF = async ({
  especie,
  estadisticas,
  data,
  region,
  chartContainer
}) => {
  try {
    console.log('🎨 Generando PDF corporativo con diseño impecable...', { especie, region });
    
    // =====================================================
    // VALIDACIÓN DE DATOS
    // =====================================================
    if (!especie || !estadisticas || !data) {
      throw new Error('Faltan datos requeridos para generar el PDF');
    }

    // =====================================================
    // INICIALIZACIÓN DEL DOCUMENTO
    // =====================================================
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    // Dimensiones de página
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const contentWidth = pageWidth - (2 * DESIGN.MARGINS.PAGE);
    
    // Posición Y inicial
    let currentY = 0;

    // =====================================================
    // HEADER CORPORATIVO
    // =====================================================
    
    // Rectángulo de encabezado (Indigo oscuro #4338ca)
    doc.setFillColor(...DESIGN.COLORS.INDIGO_DARK);
    doc.rect(0, 0, pageWidth, DESIGN.MARGINS.HEADER_HEIGHT, 'F');
    
    // Logo/Nombre de la aplicación (izquierda)
    doc.setFont(DESIGN.FONTS.FAMILY, 'bold');
    doc.setFontSize(DESIGN.FONTS.SIZES.TITLE);
    doc.setTextColor(...DESIGN.COLORS.WHITE);
    doc.text('Aqua-Data PM', DESIGN.MARGINS.PAGE, 12);
    
    // Subtítulo (izquierda, debajo del título)
    doc.setFont(DESIGN.FONTS.FAMILY, 'normal');
    doc.setFontSize(8);
    doc.text('Sistema de Análisis Pesquero', DESIGN.MARGINS.PAGE, 18);
    
    // Título del reporte (derecha)
    doc.setFont(DESIGN.FONTS.FAMILY, 'bold');
    doc.setFontSize(DESIGN.FONTS.SIZES.SUBTITLE);
    doc.text('Reporte de Trazabilidad Industrial', pageWidth - DESIGN.MARGINS.PAGE, 12, { align: 'right' });
    
    // Subtítulo del reporte (derecha)
    doc.setFont(DESIGN.FONTS.FAMILY, 'normal');
    doc.setFontSize(8);
    doc.text('Análisis Oferta-Demanda', pageWidth - DESIGN.MARGINS.PAGE, 18, { align: 'right' });
    
    // Actualizar posición Y después del header
    currentY = DESIGN.MARGINS.HEADER_HEIGHT + 3; // Solo 3mm después del header

    // =====================================================
    // METADATOS (Fecha y Especie) - Gris oscuro #4b5563
    // =====================================================
    
    doc.setFont(DESIGN.FONTS.FAMILY, 'normal');
    doc.setFontSize(DESIGN.FONTS.SIZES.BODY);
    doc.setTextColor(...DESIGN.COLORS.GRAY_DARK);
    
    // Fecha de emisión
    const fechaEmision = new Date().toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
    doc.text(`Fecha de Emisión: ${fechaEmision}`, pageWidth - DESIGN.MARGINS.PAGE, currentY, { align: 'right' });
    
    currentY += 4; // Solo 4mm entre líneas
    
    // Especie analizada
    doc.setFont(DESIGN.FONTS.FAMILY, 'bold');
    doc.text(`Especie: ${especie}`, pageWidth - DESIGN.MARGINS.PAGE, currentY, { align: 'right' });
    
    currentY += 4; // Solo 4mm entre líneas
    
    // Región
    doc.setFont(DESIGN.FONTS.FAMILY, 'normal');
    const regionText = region === 'TODAS' ? 'Macro-Zona Sur de Chile' : region;
    doc.text(`Región: ${regionText}`, pageWidth - DESIGN.MARGINS.PAGE, currentY, { align: 'right' });
    
    currentY += 8; // 8mm antes de los KPIs

    // =====================================================
    // INDICADORES CLAVE
    // =====================================================
    
    // Título de sección
    doc.setFont(DESIGN.FONTS.FAMILY, 'bold');
    doc.setFontSize(DESIGN.FONTS.SIZES.SECTION);
    doc.setTextColor(...DESIGN.COLORS.INDIGO);
    doc.text('Indicadores Clave de Desempeño', DESIGN.MARGINS.PAGE, currentY);
    
    currentY += 6; // Solo 6mm de separación
    
    // Dibujar KPIs en grid 2x2
    const kpiWidth = (contentWidth - 5) / 2;
    const kpiHeight = 18;
    const kpiGap = 5;
    
    // KPI 1: Total Desembarcado
    drawKPI(doc, DESIGN.MARGINS.PAGE, currentY, kpiWidth, kpiHeight, {
      label: 'Total Desembarcado',
      value: `${estadisticas.totalDesembarque.toLocaleString('es-CL')} ton`,
      color: [59, 130, 246] // Azul
    });
    
    // KPI 2: Materia Prima
    drawKPI(doc, DESIGN.MARGINS.PAGE + kpiWidth + kpiGap, currentY, kpiWidth, kpiHeight, {
      label: 'Materia Prima Industrial',
      value: `${estadisticas.totalMateriaPrima.toLocaleString('es-CL')} ton`,
      color: [16, 185, 129] // Verde
    });
    
    currentY += kpiHeight + 3;
    
    // KPI 3: % Procesado
    drawKPI(doc, DESIGN.MARGINS.PAGE, currentY, kpiWidth, kpiHeight, {
      label: '% Procesado Industrialmente',
      value: `${estadisticas.porcentajeProcesado}%`,
      color: [139, 92, 246] // Púrpura
    });
    
    // KPI 4: Otros Destinos
    drawKPI(doc, DESIGN.MARGINS.PAGE + kpiWidth + kpiGap, currentY, kpiWidth, kpiHeight, {
      label: 'Otros Destinos',
      value: `${estadisticas.totalBrecha.toLocaleString('es-CL')} ton`,
      color: [245, 158, 11] // Ámbar
    });
    
    currentY += kpiHeight + 8; // Solo 8mm después de los KPIs

    // =====================================================
    // GRÁFICO DE TRAZABILIDAD (SIN DEFORMACIÓN)
    // =====================================================
    
    if (chartContainer) {
      try {
        console.log('📸 Capturando gráfico con proporción exacta...');
        
        // Verificar si necesita nueva página
        if (currentY + 80 > pageHeight - 30) {
          doc.addPage();
          currentY = DESIGN.MARGINS.PAGE;
        }
        
        // Título del gráfico
        doc.setFont(DESIGN.FONTS.FAMILY, 'bold');
        doc.setFontSize(DESIGN.FONTS.SIZES.SECTION);
        doc.setTextColor(...DESIGN.COLORS.INDIGO);
        doc.text('Análisis de Trazabilidad de Volumen', DESIGN.MARGINS.PAGE, currentY);
        
        currentY += 6; // Solo 6mm entre título y gráfico
        
        // Capturar gráfico con alta calidad
        const canvas = await html2canvas(chartContainer, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          imageTimeout: 0,
          removeContainer: false,
          windowWidth: chartContainer.scrollWidth,
          windowHeight: chartContainer.scrollHeight,
          // Eliminar padding/margin del contenedor
          onclone: (clonedDoc) => {
            const clonedContainer = clonedDoc.querySelector('.pdf-capture-area');
            if (clonedContainer) {
              clonedContainer.style.padding = '0';
              clonedContainer.style.margin = '0';
            }
          }
        });
        
        console.log('✅ Gráfico capturado:', canvas.width, 'x', canvas.height, 'px');
        
        // Convertir a imagen
        const imgData = canvas.toDataURL('image/png', 1.0);
        
        // ============================================================
        // CÁLCULO PRECISO DE DIMENSIONES (SIN DEFORMACIÓN)
        // Fórmula: imgHeight = (canvas.height * pdfContentWidth) / canvas.width
        // ============================================================
        const pdfContentWidth = contentWidth - 10; // 5mm margen a cada lado
        const imgHeight = (canvas.height * pdfContentWidth) / canvas.width;
        
        // Centrar horizontalmente
        const imgX = DESIGN.MARGINS.PAGE + 5;
        
        console.log('📐 Dimensiones del gráfico en PDF:', {
          width: pdfContentWidth,
          height: imgHeight,
          aspectRatio: canvas.width / canvas.height,
          x: imgX,
          y: currentY
        });
        
        // Verificar si la imagen cabe en la página actual
        if (currentY + imgHeight > pageHeight - 30) {
          doc.addPage();
          currentY = DESIGN.MARGINS.PAGE;
        }
        
        // Agregar imagen al PDF (centrada y sin deformación)
        doc.addImage(imgData, 'PNG', imgX, currentY, pdfContentWidth, imgHeight, undefined, 'FAST');
        
        // CRÍTICO: Actualizar currentY inmediatamente después del gráfico
        currentY = currentY + imgHeight + 8; // Solo 8mm de separación con la tabla
        
      } catch (error) {
        console.warn('⚠️ Error al capturar gráfico:', error.message);
        // Mensaje de error en el PDF
        doc.setFont(DESIGN.FONTS.FAMILY, 'italic');
        doc.setFontSize(DESIGN.FONTS.SIZES.BODY);
        doc.setTextColor(...DESIGN.COLORS.GRAY_DARK);
        doc.text('(Gráfico no disponible)', DESIGN.MARGINS.PAGE, currentY);
        currentY += 8; // Solo 8mm si no hay gráfico
      }
    }

    // =====================================================
    // TABLA DE DATOS PROFESIONAL (ESTILO MODERNO)
    // =====================================================
    
    // Verificar si necesita nueva página
    if (currentY + 60 > pageHeight - 30) {
      doc.addPage();
      currentY = DESIGN.MARGINS.PAGE;
    }
    
    // Título de la tabla
    doc.setFont(DESIGN.FONTS.FAMILY, 'bold');
    doc.setFontSize(DESIGN.FONTS.SIZES.SECTION);
    doc.setTextColor(...DESIGN.COLORS.INDIGO);
    doc.text('Datos Anuales Detallados', DESIGN.MARGINS.PAGE, currentY);
    
    currentY += 6; // Solo 6mm entre título y tabla
    
    // Preparar datos de la tabla
    const tableData = data.map(item => [
      item.año?.toString() || 'N/A',
      (item.desembarque || 0).toLocaleString('es-CL'),
      (item.materiaPrima || 0).toLocaleString('es-CL'),
      (item.brecha || 0).toLocaleString('es-CL'),
      item.desembarque > 0 
        ? `${((item.materiaPrima / item.desembarque) * 100).toFixed(1)}%`
        : '0%'
    ]);
    
    console.log('📊 Generando tabla con', tableData.length, 'filas');
    
    // Generar tabla con autoTable (ESTILO MODERNO)
    // CRÍTICO: Usar currentY dinámico para eliminar espacio muerto
    autoTable(doc, {
      startY: currentY, // Posición dinámica calculada
      head: [['Año', 'Desembarque (ton)', 'Materia Prima (ton)', 'Brecha (ton)', '% Procesado']],
      body: tableData,
      theme: 'grid',
      
      // Estilos del encabezado (MORADO CORPORATIVO #4f46e5)
      headStyles: {
        fillColor: DESIGN.COLORS.INDIGO,      // [79, 70, 229]
        textColor: 255,                        // Blanco
        fontStyle: 'bold',
        fontSize: 10,
        halign: 'center',
        font: DESIGN.FONTS.FAMILY
      },
      
      // Estilos del cuerpo (GRIS OSCURO #323232)
      bodyStyles: {
        textColor: DESIGN.COLORS.GRAY_TEXT[0], // 50 (gris oscuro, no negro puro)
        fontSize: 9,
        font: DESIGN.FONTS.FAMILY,
        cellPadding: 3
      },
      
      // Filas alternadas (GRIS MUY SUAVE #f3f4f6)
      alternateRowStyles: {
        fillColor: DESIGN.COLORS.GRAY_LIGHT    // [243, 244, 246]
      },
      
      // Estilos de columnas específicas
      columnStyles: {
        0: { 
          halign: 'center', 
          fontStyle: 'bold',
          cellWidth: 20
        },
        1: { 
          halign: 'right',
          cellWidth: 35
        },
        2: { 
          halign: 'right',
          cellWidth: 38
        },
        3: { 
          halign: 'right',
          cellWidth: 30
        },
        4: { 
          halign: 'center',
          fontStyle: 'bold',
          cellWidth: 25
        }
      },
      
      // Márgenes
      margin: { 
        top: DESIGN.MARGINS.SECTION_GAP,
        left: DESIGN.MARGINS.PAGE,
        right: DESIGN.MARGINS.PAGE
      },
      
      // Personalización adicional
      didDrawCell: (data) => {
        // Colorear la columna de % Procesado según el valor
        if (data.column.index === 4 && data.section === 'body') {
          const percentText = data.cell.text[0];
          const percent = parseFloat(percentText);
          
          if (percent < 50) {
            // Rojo/Ámbar para valores bajos
            doc.setTextColor(245, 158, 11);
          } else if (percent > 80) {
            // Verde para valores altos
            doc.setTextColor(16, 185, 129);
          } else {
            // Azul para valores medios
            doc.setTextColor(59, 130, 246);
          }
        }
      }
    });
    
    // Actualizar posición Y después de la tabla
    currentY = doc.lastAutoTable.finalY + 8; // Solo 8mm después de la tabla

    // =====================================================
    // ANÁLISIS Y CONCLUSIONES
    // =====================================================
    
    // Verificar si necesita nueva página
    if (currentY + 40 > pageHeight - 30) {
      doc.addPage();
      currentY = DESIGN.MARGINS.PAGE;
    }
    
    // Título
    doc.setFont(DESIGN.FONTS.FAMILY, 'bold');
    doc.setFontSize(DESIGN.FONTS.SIZES.SECTION);
    doc.setTextColor(...DESIGN.COLORS.INDIGO);
    doc.text('Análisis y Conclusiones', DESIGN.MARGINS.PAGE, currentY);
    
    currentY += 6; // Solo 6mm entre título y contenido
    
    // Generar texto de análisis
    let analisisText = '';
    if (estadisticas.porcentajeProcesado < 50) {
      analisisText = `Baja integración industrial: Solo el ${estadisticas.porcentajeProcesado}% de la captura de ${especie} ingresa a plantas de procesamiento. La mayor parte se destina a consumo fresco, exportación directa o procesamiento artesanal.`;
    } else if (estadisticas.porcentajeProcesado > 80) {
      analisisText = `Alta integración industrial: El ${estadisticas.porcentajeProcesado}% de ${especie} se procesa industrialmente, indicando una cadena de suministro bien integrada con la industria de elaboración.`;
    } else {
      analisisText = `Integración moderada: El ${estadisticas.porcentajeProcesado}% de la captura ingresa a plantas industriales, mientras que el ${estadisticas.porcentajeOtrosDestinos}% se destina a otros usos.`;
    }
    
    // Caja de análisis
    doc.setFillColor(...DESIGN.COLORS.GRAY_LIGHT);
    doc.roundedRect(DESIGN.MARGINS.PAGE, currentY - 3, contentWidth, 25, 2, 2, 'F');
    
    // Borde
    doc.setDrawColor(...DESIGN.COLORS.INDIGO);
    doc.setLineWidth(0.5);
    doc.roundedRect(DESIGN.MARGINS.PAGE, currentY - 3, contentWidth, 25, 2, 2, 'S');
    
    // Texto del análisis
    doc.setFont(DESIGN.FONTS.FAMILY, 'normal');
    doc.setFontSize(DESIGN.FONTS.SIZES.BODY);
    doc.setTextColor(...DESIGN.COLORS.GRAY_DARK);
    
    const splitText = doc.splitTextToSize(analisisText, contentWidth - 10);
    doc.text(splitText, DESIGN.MARGINS.PAGE + 5, currentY + 3);
    
    currentY += 30;

    // =====================================================
    // PIE DE PÁGINA EN TODAS LAS PÁGINAS
    // =====================================================
    
    const totalPages = doc.internal.getNumberOfPages();
    
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      
      // Línea decorativa superior del footer
      const footerY = pageHeight - 15;
      doc.setDrawColor(...DESIGN.COLORS.GRAY_DARK);
      doc.setLineWidth(0.2);
      doc.line(DESIGN.MARGINS.PAGE, footerY, pageWidth - DESIGN.MARGINS.PAGE, footerY);
      
      // Texto del footer (centrado)
      doc.setFont(DESIGN.FONTS.FAMILY, 'normal');
      doc.setFontSize(DESIGN.FONTS.SIZES.FOOTER);
      doc.setTextColor(...DESIGN.COLORS.GRAY_DARK);
      doc.text(
        'Documento generado automáticamente - Uso Interno',
        pageWidth / 2,
        footerY + 5,
        { align: 'center' }
      );
      
      // Número de página (derecha)
      doc.setFont(DESIGN.FONTS.FAMILY, 'bold');
      doc.setFontSize(DESIGN.FONTS.SIZES.FOOTER);
      doc.text(
        `Página ${i} de ${totalPages}`,
        pageWidth - DESIGN.MARGINS.PAGE,
        footerY + 5,
        { align: 'right' }
      );
      
      // Fecha y hora (izquierda)
      const fechaHora = new Date().toLocaleString('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      doc.text(fechaHora, DESIGN.MARGINS.PAGE, footerY + 5);
    }

    // =====================================================
    // GUARDAR PDF
    // =====================================================
    
    console.log('💾 Guardando PDF...');
    const fileName = `Trazabilidad_${especie.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    console.log('✅ PDF generado exitosamente:', fileName);
    return { success: true, fileName };

  } catch (error) {
    console.error('❌ Error generando PDF:', error);
    console.error('Stack trace:', error.stack);
    throw new Error(`Error al generar el reporte PDF: ${error.message}`);
  }
};

/**
 * Dibuja una caja de KPI con diseño profesional
 */
function drawKPI(doc, x, y, width, height, { label, value, color }) {
  // Fondo blanco
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(x, y, width, height, 1.5, 1.5, 'F');
  
  // Borde colorido
  doc.setDrawColor(...color);
  doc.setLineWidth(0.5);
  doc.roundedRect(x, y, width, height, 1.5, 1.5, 'S');
  
  // Barra superior
  doc.setFillColor(...color);
  doc.rect(x, y, width, 2, 'F');
  
  // Label
  doc.setFont(DESIGN.FONTS.FAMILY, 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...DESIGN.COLORS.GRAY_DARK);
  doc.text(label, x + 3, y + 8);
  
  // Value
  doc.setFont(DESIGN.FONTS.FAMILY, 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...color);
  
  // Ajustar tamaño si es muy largo
  const valueWidth = doc.getTextWidth(value);
  if (valueWidth > width - 6) {
    doc.setFontSize(9);
  }
  
  doc.text(value, x + 3, y + 14);
}
