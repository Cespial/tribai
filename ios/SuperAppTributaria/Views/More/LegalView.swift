import SwiftUI

enum LegalPage {
    case terms
    case privacy
    case about
}

struct LegalView: View {
    let page: LegalPage

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: AppSpacing.sm) {
                switch page {
                case .terms:
                    termsContent
                case .privacy:
                    privacyContent
                case .about:
                    aboutContent
                }
            }
            .padding(AppSpacing.sm)
        }
        .background(Color.appBackground)
        .navigationTitle(navigationTitle)
        .navigationBarTitleDisplayMode(.large)
    }

    private var navigationTitle: String {
        switch page {
        case .terms: "Terminos de Uso"
        case .privacy: "Politica de Privacidad"
        case .about: "Acerca de"
        }
    }

    // MARK: - Terms of Use

    private var termsContent: some View {
        VStack(alignment: .leading, spacing: 16) {
            legalHeading("Terminos y Condiciones de Uso")
            legalDate("Ultima actualizacion: marzo 2026")

            legalSection("1. Aceptacion de los Terminos") {
                "Al descargar, instalar o utilizar TribAI (en adelante \"la Aplicacion\"), usted acepta estos Terminos de Uso en su totalidad. Si no esta de acuerdo, no utilice la Aplicacion."
            }

            legalSection("2. Naturaleza del Servicio") {
                "La Aplicacion es una herramienta informativa y de referencia tributaria. Proporciona acceso al Estatuto Tributario de Colombia, calculadoras fiscales, calendario de obligaciones tributarias y un asistente basado en inteligencia artificial generativa."
            }

            legalSection("3. Exclusion de Asesoria Profesional") {
                "IMPORTANTE: La informacion proporcionada por esta Aplicacion, incluyendo las respuestas del asistente de inteligencia artificial, los resultados de las calculadoras y cualquier otro contenido, tiene caracter exclusivamente informativo y educativo.\n\nEsta Aplicacion NO constituye asesoria tributaria, contable, financiera ni legal profesional. Los resultados son aproximados y pueden no reflejar su situacion particular.\n\nPara decisiones tributarias, consulte siempre con un contador publico certificado o un abogado tributarista debidamente autorizado en Colombia."
            }

            legalSection("4. Inteligencia Artificial Generativa") {
                "El asistente tributario utiliza modelos de inteligencia artificial generativa (IA) para procesar consultas. Las respuestas son generadas automaticamente a partir de fuentes como el Estatuto Tributario, doctrina DIAN y jurisprudencia, pero pueden contener imprecisiones o estar desactualizadas.\n\nEl usuario reconoce que:\n- Las respuestas de la IA no son infalibles y deben verificarse.\n- La IA puede generar contenido que no refleje la normatividad vigente.\n- tribai.co no garantiza la exactitud, integridad ni vigencia de las respuestas generadas."
            }

            legalSection("5. Precision de los Calculos") {
                "Las calculadoras tributarias utilizan las tarifas, topes y valores vigentes para el ano gravable 2026 (UVT $52.374, SMLMV $1.750.905). Los resultados son estimaciones y pueden diferir de los calculos definitivos segun la situacion particular de cada contribuyente."
            }

            legalSection("6. Propiedad Intelectual") {
                "El contenido del Estatuto Tributario es de dominio publico. El diseno, codigo fuente, marca tribai.co, las herramientas de analisis y la capa de inteligencia artificial son propiedad de sus creadores y estan protegidos por las leyes de propiedad intelectual aplicables."
            }

            legalSection("7. Limitacion de Responsabilidad") {
                "En la maxima medida permitida por la ley colombiana, tribai.co y sus creadores no seran responsables por danos directos, indirectos, incidentales o consecuentes derivados del uso de la Aplicacion, incluyendo pero no limitado a: errores en calculos, interpretaciones incorrectas de la IA, decisiones tributarias basadas en la informacion proporcionada, o sanciones de la DIAN."
            }

            legalSection("8. Modificaciones") {
                "Nos reservamos el derecho de modificar estos Terminos en cualquier momento. Las modificaciones entraran en vigor al publicarse en la Aplicacion. El uso continuado implica la aceptacion de los terminos modificados."
            }

            legalSection("9. Legislacion Aplicable") {
                "Estos Terminos se rigen por las leyes de la Republica de Colombia."
            }
        }
    }

    // MARK: - Privacy Policy

    private var privacyContent: some View {
        VStack(alignment: .leading, spacing: 16) {
            legalHeading("Politica de Privacidad")
            legalDate("Ultima actualizacion: marzo 2026")

            legalSection("1. Informacion que Recopilamos") {
                "Recopilamos la siguiente informacion cuando utiliza la Aplicacion:\n\n- Datos de cuenta (Sign in with Apple): nombre, correo electronico e identificador de usuario, exclusivamente para autenticacion.\n- Consultas al asistente: las preguntas enviadas al asistente de IA se procesan en servidores externos para generar respuestas. No almacenamos el historial de consultas en nuestros servidores.\n- Datos locales: el historial de conversaciones, favoritos, notas y preferencias se almacenan unicamente en su dispositivo."
            }

            legalSection("2. Uso de la Informacion") {
                "Utilizamos la informacion recopilada exclusivamente para:\n\n- Autenticar su identidad mediante Apple Sign In.\n- Procesar sus consultas tributarias a traves del asistente de IA.\n- Mejorar la calidad del servicio."
            }

            legalSection("3. Servicios de Terceros") {
                "La Aplicacion utiliza los siguientes servicios de terceros para funcionar:\n\n- Anthropic (Claude): procesamiento de lenguaje natural para el asistente de IA. Las consultas se envian a los servidores de Anthropic para generar respuestas.\n- Pinecone: busqueda semantica en la base de conocimiento tributaria.\n- Apple: autenticacion mediante Sign in with Apple.\n\nCada servicio tiene su propia politica de privacidad y tratamiento de datos."
            }

            legalSection("4. Almacenamiento Local") {
                "Los siguientes datos se almacenan exclusivamente en su dispositivo:\n\n- Historial de conversaciones con el asistente (hasta 30 conversaciones).\n- Articulos favoritos y notas personales.\n- Preferencias de la aplicacion.\n- Credenciales de autenticacion (en el Keychain del dispositivo).\n\nEstos datos no se transmiten a ningun servidor externo."
            }

            legalSection("5. Rastreo y Analitica") {
                "La Aplicacion NO realiza rastreo de usuarios (tracking). No utilizamos cookies, pixels de seguimiento, ni herramientas de analitica de terceros. No compartimos datos con redes publicitarias."
            }

            legalSection("6. Seguridad") {
                "Implementamos las siguientes medidas de seguridad:\n\n- Autenticacion biometrica (Face ID / Touch ID) para proteger el acceso.\n- Almacenamiento seguro de credenciales en el Keychain de iOS.\n- Comunicaciones cifradas (HTTPS/TLS) con todos los servicios externos.\n- Rate limiting para prevenir uso abusivo."
            }

            legalSection("7. Derechos del Usuario") {
                "De acuerdo con la Ley 1581 de 2012 (Habeas Data) de Colombia, usted tiene derecho a:\n\n- Conocer, actualizar y rectificar sus datos personales.\n- Solicitar la eliminacion de sus datos.\n- Revocar la autorizacion para el tratamiento de datos.\n- Acceder gratuitamente a sus datos personales.\n\nPara ejercer estos derechos, contactenos a traves de los canales indicados en la Aplicacion."
            }

            legalSection("8. Menores de Edad") {
                "La Aplicacion no esta dirigida a menores de 18 anos. No recopilamos intencionalmente informacion de menores."
            }

            legalSection("9. Cambios a esta Politica") {
                "Nos reservamos el derecho de actualizar esta politica. Notificaremos cambios significativos a traves de la Aplicacion."
            }
        }
    }

    // MARK: - About

    private var aboutContent: some View {
        VStack(alignment: .leading, spacing: 16) {
            // App info card
            VStack(spacing: 12) {
                Image(systemName: "building.columns")
                    .font(.system(size: 48))
                    .foregroundStyle(Color.appPrimary)

                Text("TribAI")
                    .font(.system(size: 24, weight: .bold))
                    .foregroundStyle(Color.appForeground)

                Text("tribai.co")
                    .font(AppTypography.bodyDefault)
                    .foregroundStyle(Color.appMutedForeground)

                Text("Version 1.0.0")
                    .font(AppTypography.caption)
                    .foregroundStyle(Color.appMutedForeground)
            }
            .frame(maxWidth: .infinity)
            .padding(AppSpacing.md)
            .background(Color.appCard)
            .clipShape(RoundedRectangle(cornerRadius: AppRadius.card))
            .overlay(
                RoundedRectangle(cornerRadius: AppRadius.card)
                    .stroke(Color.appBorder, lineWidth: 1)
            )

            // Description
            legalSection("Que es tribai.co") {
                "tribai.co (tributaria + AI + Colombia) es la plataforma tributaria mas completa de Colombia. Combina 35+ calculadoras fiscales, los 1.294 articulos del Estatuto Tributario indexados y navegables, un asistente de inteligencia artificial, calendario fiscal, doctrina DIAN, indicadores economicos, glosario tributario y guias interactivas."
            }

            // AI Disclosure
            VStack(alignment: .leading, spacing: 8) {
                HStack(spacing: 8) {
                    Image(systemName: "cpu")
                        .foregroundStyle(Color.appPrimary)
                    Text("Uso de Inteligencia Artificial")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundStyle(Color.appForeground)
                }

                Text("Esta aplicacion utiliza inteligencia artificial generativa (modelos de lenguaje de Anthropic) para su asistente tributario. Las respuestas se generan automaticamente a partir del Estatuto Tributario, doctrina DIAN, jurisprudencia y otras fuentes normativas.\n\nLas respuestas de la IA son informativas y pueden contener imprecisiones. Siempre verifique la informacion con un profesional tributario certificado.")
                    .font(AppTypography.bodySmall)
                    .foregroundStyle(Color.appMutedForeground)
            }
            .padding(AppSpacing.sm)
            .background(Color.appMuted)
            .clipShape(RoundedRectangle(cornerRadius: AppRadius.card))

            // Data sources
            legalSection("Fuentes de Datos") {
                "- Estatuto Tributario: 1.294 articulos (fuente: estatuto.co)\n- Doctrina DIAN: ~15.000 conceptos oficiales\n- Jurisprudencia: Corte Constitucional y Consejo de Estado\n- Decretos reglamentarios: DUR 1625 de 2016 y modificaciones\n- Resoluciones DIAN vigentes\n- Leyes tributarias del Congreso de la Republica\n\nValores tributarios 2026: UVT $52.374, SMLMV $1.750.905, Auxilio de transporte $249.095."
            }

            // Credits
            legalSection("Creditos") {
                "Desarrollado en Colombia.\nDiseño y desarrollo: tribai.co\nIngenieria: fourier.dev | inplux.co\nPowered by Anthropic Claude y Pinecone."
            }
        }
    }

    // MARK: - Helpers

    private func legalHeading(_ text: String) -> some View {
        Text(text)
            .font(.system(size: 22, weight: .bold))
            .foregroundStyle(Color.appForeground)
    }

    private func legalDate(_ text: String) -> some View {
        Text(text)
            .font(AppTypography.caption)
            .foregroundStyle(Color.appMutedForeground)
    }

    private func legalSection(_ title: String, content: () -> String) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title)
                .font(.system(size: 16, weight: .semibold))
                .foregroundStyle(Color.appForeground)
            Text(content())
                .font(AppTypography.bodySmall)
                .foregroundStyle(Color.appMutedForeground)
        }
    }
}
