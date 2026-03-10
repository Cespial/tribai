import UIKit

enum PDFExportService {

    struct PDFContent {
        let title: String
        let subtitle: String
        let rows: [(label: String, value: String)]
        let disclaimer: String?
        let date: Date
    }

    static func generatePDF(from content: PDFContent) -> Data {
        let pageWidth: CGFloat = 612
        let pageHeight: CGFloat = 792
        let margin: CGFloat = 50
        let contentWidth = pageWidth - margin * 2

        let renderer = UIGraphicsPDFRenderer(bounds: CGRect(x: 0, y: 0, width: pageWidth, height: pageHeight))

        return renderer.pdfData { context in
            context.beginPage()
            var y: CGFloat = margin

            // Title
            let titleAttrs: [NSAttributedString.Key: Any] = [
                .font: UIFont.systemFont(ofSize: 22, weight: .bold),
                .foregroundColor: UIColor.label,
            ]
            let titleString = NSAttributedString(string: content.title, attributes: titleAttrs)
            titleString.draw(in: CGRect(x: margin, y: y, width: contentWidth, height: 30))
            y += 35

            // Subtitle
            let subtitleAttrs: [NSAttributedString.Key: Any] = [
                .font: UIFont.systemFont(ofSize: 14, weight: .regular),
                .foregroundColor: UIColor.secondaryLabel,
            ]
            let subtitleString = NSAttributedString(string: content.subtitle, attributes: subtitleAttrs)
            subtitleString.draw(in: CGRect(x: margin, y: y, width: contentWidth, height: 20))
            y += 25

            // Date
            let dateFormatter = DateFormatter()
            dateFormatter.dateStyle = .long
            dateFormatter.locale = Locale(identifier: "es_CO")
            let dateString = NSAttributedString(
                string: "Generado: \(dateFormatter.string(from: content.date))",
                attributes: subtitleAttrs
            )
            dateString.draw(in: CGRect(x: margin, y: y, width: contentWidth, height: 20))
            y += 30

            // Divider
            let dividerPath = UIBezierPath()
            dividerPath.move(to: CGPoint(x: margin, y: y))
            dividerPath.addLine(to: CGPoint(x: margin + contentWidth, y: y))
            UIColor.separator.setStroke()
            dividerPath.lineWidth = 0.5
            dividerPath.stroke()
            y += 15

            // Rows
            let labelAttrs: [NSAttributedString.Key: Any] = [
                .font: UIFont.systemFont(ofSize: 12, weight: .regular),
                .foregroundColor: UIColor.secondaryLabel,
            ]
            let valueAttrs: [NSAttributedString.Key: Any] = [
                .font: UIFont.systemFont(ofSize: 12, weight: .semibold),
                .foregroundColor: UIColor.label,
            ]

            for row in content.rows {
                if y > pageHeight - margin - 30 {
                    context.beginPage()
                    y = margin
                }

                let labelStr = NSAttributedString(string: row.label, attributes: labelAttrs)
                let valueStr = NSAttributedString(string: row.value, attributes: valueAttrs)

                labelStr.draw(in: CGRect(x: margin, y: y, width: contentWidth * 0.6, height: 18))
                let valueSize = valueStr.size()
                valueStr.draw(in: CGRect(x: margin + contentWidth - valueSize.width, y: y, width: valueSize.width, height: 18))
                y += 22
            }

            // Disclaimer
            if let disclaimer = content.disclaimer {
                y += 15
                let disclaimerAttrs: [NSAttributedString.Key: Any] = [
                    .font: UIFont.systemFont(ofSize: 9, weight: .regular),
                    .foregroundColor: UIColor.tertiaryLabel,
                ]
                let disclaimerStr = NSAttributedString(string: disclaimer, attributes: disclaimerAttrs)
                disclaimerStr.draw(in: CGRect(x: margin, y: y, width: contentWidth, height: 100))
            }

            // Footer
            let footerAttrs: [NSAttributedString.Key: Any] = [
                .font: UIFont.systemFont(ofSize: 8, weight: .light),
                .foregroundColor: UIColor.quaternaryLabel,
            ]
            let footerStr = NSAttributedString(string: "TribAI — tribai.co", attributes: footerAttrs)
            footerStr.draw(in: CGRect(x: margin, y: pageHeight - margin + 10, width: contentWidth, height: 15))
        }
    }
}
