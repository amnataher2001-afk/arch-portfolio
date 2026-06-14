import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const MAX_CANVAS_WIDTH = 1200 // cap rasterized page width for speed + size

/**
 * Render every .portfolio-page inside `container` to a multi-page A4 PDF.
 * There is NO page cap — every .portfolio-page node becomes one PDF page.
 *
 * Speed/size: each page is rasterized at most ~1200px wide and encoded as a
 * compressed JPEG, which keeps the file small and the export fast.
 *
 * @param {HTMLElement} container element containing .portfolio-page nodes
 * @param {string} fileName output file name
 * @param {(done:number,total:number)=>void} onProgress optional progress cb
 */
export async function exportPortfolioPDF(container, fileName = 'portfolio.pdf', onProgress) {
  const pages = container.querySelectorAll('.portfolio-page')
  if (pages.length === 0) throw new Error('Nothing to export.')

  // Web fonts must be loaded before rasterizing, or text uses fallback metrics.
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

    // Resize to max 1200px wide before rasterizing (downscale source images
    // too, since html2canvas renders at displaySize × scale).
    const scale = Math.min(2, MAX_CANVAS_WIDTH / node.offsetWidth)

    const canvas = await html2canvas(node, {
      scale,
      useCORS: true,
      backgroundColor: bg,
      logging: false,
      imageTimeout: 0,
      width: node.offsetWidth,
      height: node.offsetHeight,
      windowWidth: node.offsetWidth,
      windowHeight: node.offsetHeight,
    })

    // Compressed JPEG keeps the PDF small and fast to build.
    const imgData = canvas.toDataURL('image/jpeg', 0.8)

    // Always place at full page width; if the page is slightly taller than A4
    // the overflow is clipped by the page edge (never squished into a strip).
    const imgW = pageW
    const imgH = (canvas.height * pageW) / canvas.width

    if (i > 0) pdf.addPage()
    pdf.addImage(imgData, 'JPEG', 0, 0, imgW, imgH, undefined, 'FAST')

    onProgress?.(i + 1, pages.length)
    // Yield so the progress UI can paint between pages.
    await new Promise((r) => setTimeout(r, 0))
  }

  pdf.save(fileName)
}
