import Foundation
import AppKit
import CoreGraphics
let a = CommandLine.arguments
guard let src = NSImage(contentsOfFile: a[1]),
      let cg = src.cgImage(forProposedRect: nil, context: nil, hints: nil) else { exit(1) }
let x = Int(a[3])!, y = Int(a[4])!, w = Int(a[5])!, h = Int(a[6])!, docelowa = Int(a[7])!
guard let wyciety = cg.cropping(to: CGRect(x: x, y: y, width: w, height: h)) else { exit(1) }
let nw = docelowa, nh = Int(Double(h) * Double(docelowa) / Double(w))
guard let ctx = CGContext(data: nil, width: nw, height: nh, bitsPerComponent: 8,
        bytesPerRow: 0, space: CGColorSpaceCreateDeviceRGB(),
        bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue) else { exit(1) }
ctx.interpolationQuality = .high
ctx.draw(wyciety, in: CGRect(x: 0, y: 0, width: nw, height: nh))
let rep = NSBitmapImageRep(cgImage: ctx.makeImage()!)
try rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: a[2]))
print("\(a[2]) \(nw)x\(nh)")
