// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "SuperAppTributaria",
    platforms: [
        .iOS(.v17)
    ],
    products: [
        .library(
            name: "SuperAppTributaria",
            targets: ["SuperAppTributaria"]
        ),
    ],
    dependencies: [
        .package(url: "https://github.com/gonzalezreal/swift-markdown-ui.git", from: "2.4.0"),
        .package(url: "https://github.com/kishikawakatsumi/KeychainAccess.git", from: "4.2.2"),
        .package(url: "https://github.com/getsentry/sentry-cocoa.git", from: "8.40.0"),
    ],
    targets: [
        .target(
            name: "SuperAppTributaria",
            dependencies: [
                .product(name: "MarkdownUI", package: "swift-markdown-ui"),
                .product(name: "KeychainAccess", package: "KeychainAccess"),
                .product(name: "Sentry", package: "sentry-cocoa"),
            ],
            path: "SuperAppTributaria"
        ),
        .testTarget(
            name: "SuperAppTributariaTests",
            dependencies: ["SuperAppTributaria"],
            path: "SuperAppTributariaTests"
        ),
    ]
)
