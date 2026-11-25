import Foundation
import AVFoundation
import CoreGraphics
import ImageIO

// 소개 영상의 서로 다른 장면에서 서비스 UI만 추출한다. 새 가상 화면은 생성하지 않는다.
// 사용법: swift extract-project-stills.swift <portfolio-concepts 경로> <details 출력 경로>
struct ExtractError: Error, CustomStringConvertible { let description: String }
let arguments = Array(CommandLine.arguments.suffix(2))
guard arguments.count == 2 else { throw ExtractError(description: "Provide source and destination directories") }
let source = URL(fileURLWithPath: arguments[0], isDirectory: true)
let destination = URL(fileURLWithPath: arguments[1], isDirectory: true)
try FileManager.default.createDirectory(at: destination, withIntermediateDirectories: true)

struct Still {
    let source: String
    let name: String
    let seconds: Double
    let crop: CGRect
}

let stills: [Still] = [
    Still(source: "ddoga-store-macos", name: "ddoga-store-home", seconds: 1.2, crop: CGRect(x: 513, y: 147, width: 575, height: 787)),
    Still(source: "ddoga-store-macos", name: "ddoga-store-products", seconds: 5.2, crop: CGRect(x: 513, y: 147, width: 575, height: 787)),
    Still(source: "ddoga-store-macos", name: "ddoga-store-categories", seconds: 1.6, crop: CGRect(x: 513, y: 588, width: 575, height: 346)),
    Still(source: "ddoga-platform-macos", name: "ddoga-platform-facilities", seconds: 1.2, crop: CGRect(x: 513, y: 147, width: 575, height: 787)),
    Still(source: "ddoga-platform-macos", name: "ddoga-platform-guides", seconds: 5.2, crop: CGRect(x: 513, y: 147, width: 575, height: 787)),
    Still(source: "ims-macos", name: "ims-dashboard", seconds: 1.2, crop: CGRect(x: 275, y: 150, width: 1220, height: 780)),
    Still(source: "ims-macos", name: "ims-customers", seconds: 4.6, crop: CGRect(x: 275, y: 150, width: 1220, height: 780)),
    Still(source: "ims-macos", name: "ims-members", seconds: 8.0, crop: CGRect(x: 275, y: 150, width: 1220, height: 780)),
    Still(source: "care-solution-macos", name: "care-solution-nursing", seconds: 4.6, crop: CGRect(x: 263, y: 150, width: 1232, height: 780)),
    Still(source: "care-solution-macos", name: "care-solution-therapy", seconds: 8.0, crop: CGRect(x: 263, y: 150, width: 1232, height: 780)),
    Still(source: "care-note-iphone-v2", name: "care-note-home", seconds: 1.2, crop: CGRect(x: 618, y: 108, width: 364, height: 808)),
    Still(source: "care-note-iphone-v2", name: "care-note-switching", seconds: 5.2, crop: CGRect(x: 618, y: 108, width: 364, height: 808)),
    Still(source: "uplus-baseball-iphone", name: "uplus-baseball-news", seconds: 4.5, crop: CGRect(x: 605, y: 108, width: 390, height: 808)),
    Still(source: "uplus-baseball-iphone", name: "uplus-baseball-schedule", seconds: 8.0, crop: CGRect(x: 605, y: 108, width: 390, height: 808)),
]

var generators: [String: AVAssetImageGenerator] = [:]
for still in stills {
    try autoreleasepool {
        let generator: AVAssetImageGenerator
        if let cached = generators[still.source] { generator = cached }
        else {
            let asset = AVURLAsset(url: source.appendingPathComponent(still.source + ".mp4"))
            generator = AVAssetImageGenerator(asset: asset)
            generator.appliesPreferredTrackTransform = true
            generator.requestedTimeToleranceBefore = .zero
            generator.requestedTimeToleranceAfter = .zero
            generators[still.source] = generator
        }
        let frame = try generator.copyCGImage(at: CMTime(seconds: still.seconds, preferredTimescale: 600), actualTime: nil)
        guard let image = frame.cropping(to: still.crop) else { throw ExtractError(description: "Cannot crop " + still.name) }
        let url = destination.appendingPathComponent(still.name + ".jpg")
        guard let writer = CGImageDestinationCreateWithURL(url as CFURL, "public.jpeg" as CFString, 1, nil) else { throw ExtractError(description: "Cannot create " + url.path) }
        CGImageDestinationAddImage(writer, image, [kCGImageDestinationLossyCompressionQuality: 0.94] as CFDictionary)
        guard CGImageDestinationFinalize(writer) else { throw ExtractError(description: "Cannot write " + url.path) }
        print(still.name + ": \(image.width)x\(image.height)")
    }
}
print("Extracted \(stills.count) unique UI stills")
