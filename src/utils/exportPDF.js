import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

/**
 * Render every .portfolio-page inside `container` to a multi-page A4 PDF.
 * Each page node is rasterized with html2canvas, then placed on its own
 * A4 page in jsPDF.
 *
 * @param {HTMLElement} container element containing .portfolio-page nodes
 * @param {string} fileName output file name
 * @param {(done:number,total:number)=>void} onProgress optional progress cb
 */
export async function exportPortfolioPDF(container, fileName = 'portfolio.pdf', onProgress) {
  const pages = container.querySelectorAll('.portfolio-page')
  if (pages.length === 0) throw new Error('Nothing to export.')

  // Web fonts must be fully loaded before rasterizing, otherwise html2canvas
  // measures fallback-font metrics and the text overlaps.
  if (document.fonts?.ready) {
    try {
      await document.fonts.ready
    } catch {
      /* ignore */
    }
  }

  const pdf = new jsPDF({ unit: 'pt', format: 'a4', compress: true })
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()

  for (let i = 0; i < pages.length; i++) {
    const node = pages[i]
    const bg = getComputedStyle(node).backgroundColor || '#ffffff'

    const canvas = await html2canvas(node, {
      scale: 2, // high-resolution output
      useCORS: true,
      backgroundColor: bg,
      logging: false,
      // Capture at the node's real layout size, independent of any CSS
      // transform on ancestors (a transform breaks text positioning).
      width: node.offsetWidth,
      height: node.offsetHeight,
      windowWidth: node.offsetWidth,
      windowHeight: node.offsetHeight,
    })

    const imgData = canvas.toDataURL('image/jpeg', 0.95)

    // Fit the page image to A4 while preserving aspect ratio (no squishing,
    // which is what caused text to look compressed/overlapping).
    let imgW = pageW
    let imgH = (canvas.height * pageW) / canvas.width
    if (imgH > pageH) {
      imgH = pageH
      imgW = (canvas.width * pageH) / canvas.height
    }
    const x = (pageW - imgW) / 2

    if (i > 0) pdf.addPage()
    pdf.addImage(imgData, 'JPEG', x, 0, imgW, imgH)

    onProgress?.(i + 1, pages.length)
  }

  pdf.save(fileName)
}
