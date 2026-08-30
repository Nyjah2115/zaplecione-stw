import Foundation
import AppKit
import CoreGraphics

let a = CommandLine.arguments
guard let src = NSImage(contentsOfFile: a[1]),
      let cg = src.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
    print("nie moge wczytac"); exit(1)
}
// współrzędne podajemy tak, jak widać obraz: y liczone od GÓRY
let x = Int(a[3])!, yGora = Int(a[4])!, w = Int(a[5])!, h = Int(a[6])!
let docelowa = Int(a[7])!
let y = yGora   // CGImage.cropping liczy od gory
guard let wyciety = cg.cropping(to: CGRect(x: x, y: y, width: w, height: h)) else {
    print("kadr poza obrazem"); exit(1)
}
let nw = docelowa, nh = Int(Double(h) * Double(docelowa) / Double(w))
guard let ctx = CGContext(data: nil, width: nw, height: nh, bitsPerComponent: 8,
        bytesPerRow: 0, space: CGColorSpaceCreateDeviceRGB(),
        bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue) else { exit(1) }
ctx.interpolationQuality = .high
ctx.draw(wyciety, in: CGRect(x: 0, y: 0, width: nw, height: nh))
guard let out = ctx.makeImage() else { exit(1) }
let rep = NSBitmapImageRep(cgImage: out)
try rep.representation(using: .jpeg, properties: [.compressionFactor: 0.86])!
    .write(to: URL(fileURLWithPath: a[2]))
print("\(a[2]) \(nw)x\(nh) (zrodlo \(cg.width)x\(cg.height))")
