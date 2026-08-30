import Foundation
import AVFoundation
import AppKit
let a = CommandLine.arguments
let asset = AVURLAsset(url: URL(fileURLWithPath: a[1]))
let gen = AVAssetImageGenerator(asset: asset)
gen.appliesPreferredTrackTransform = true
gen.requestedTimeToleranceBefore = .zero
gen.requestedTimeToleranceAfter = .zero
gen.maximumSize = CGSize(width: 1280, height: 1280)
let t = CMTime(seconds: Double(a[3])!, preferredTimescale: 600)
let cg = try gen.copyCGImage(at: t, actualTime: nil)
let rep = NSBitmapImageRep(cgImage: cg)
let jpg = rep.representation(using: .jpeg, properties: [.compressionFactor: 0.8])!
try jpg.write(to: URL(fileURLWithPath: a[2]))
print("\(a[2]) \(cg.width)x\(cg.height)")
