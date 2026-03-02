import WidgetKit
import SwiftUI

@main
struct SuperAppTributariaWidgetBundle: WidgetBundle {
    var body: some Widget {
        DeadlineWidget()
        UVTConverterWidget()
    }
}
