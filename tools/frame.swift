import Foundation
import AVFoundation
import AppKit

let args = CommandLine.arguments
let path = args[1]
let asset = AVURLAsset(url: URL(fileURLWithPath: path))
let dur = CMTimeGetSeconds(asset.duration)
let gen = AVAssetImageGenerator(asset: asset)
gen.appliesPreferredTrackTransform = true
gen.maximumSize = CGSize(width: 640, height: 640)
var images: [NSImage] = []
for f in [0.15, 0.5, 0.85] {
    let t = CMTime(seconds: dur * f, preferredTimescale: 600)
    if let cg = try? gen.copyCGImage(at: t, actualTime: nil) {
        images.append(NSImage(cgImage: cg, size: NSSize(width: cg.width, height: cg.height)))
    }
}
guard !images.isEmpty else { exit(1) }
let w = images.reduce(0) { $0 + Int($1.size.width) }
let h = Int(images.map { $0.size.height }.max() ?? 0)
let out = NSImage(size: NSSize(width: w, height: h))
out.lockFocus()
var x = 0
for im in images {
    im.draw(in: NSRect(x: x, y: 0, width: Int(im.size.width), height: Int(im.size.height)))
    x += Int(im.size.width)
}
out.unlockFocus()
let tiff = out.tiffRepresentation!
let rep = NSBitmapImageRep(data: tiff)!
let png = rep.representation(using: .png, properties: [:])!
try png.write(to: URL(fileURLWithPath: args[2]))
print("\(path) czas=\(String(format: "%.1f", dur))s")
