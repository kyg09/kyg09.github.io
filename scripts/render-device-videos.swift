import Foundation
import AVFoundation
import CoreGraphics
import CoreImage
import ImageIO
import CoreVideo
import CoreText

// 기존 소개 영상에서 서비스 화면만 꺼내 동일한 기기 프레임에 합성합니다.
// 사용법: swift scripts/render-device-videos.swift <로컬 원본 폴더> <공개 출력 폴더>
// 예: swift scripts/render-device-videos.swift media-sources/portfolio-concepts public/assets/portfolio-concepts
// 원본 폴더의 *-exact.mp4·macOS-sources/·macOS-wallpapers/는 public 밖에 보관합니다.
struct RenderError: Error, CustomStringConvertible { let description: String }
// Swift 인터프리터가 앞쪽에 추가하는 frontend 인자와 원본·출력 경로를 구분합니다.
let paths = Array(CommandLine.arguments.suffix(2))
let sourceDirectory = URL(fileURLWithPath: paths[0], isDirectory: true)
let outputDirectory = URL(fileURLWithPath: paths[1], isDirectory: true)
let width = 1600
let height = 1000
let colorSpace = CGColorSpaceCreateDeviceRGB()
let imageContext = CIContext(options: [.cacheIntermediates: false])

// 서비스별 입력과 배경을 분리해 같은 기기 프레임을 재사용합니다.
enum InputMode { case video(CGRect), screenshots([String]), baseball }
struct VideoJob {
    let slug: String
    let output: String
    let phone: Bool
    let wallpaper: String?
    let mode: InputMode
    var topFill: Bool { slug == "ddoga-store" || slug == "ddoga-platform" }
}
let jobs: [VideoJob] = [
    VideoJob(slug: "ddoga-store", output: "ddoga-store-macos", phone: false, wallpaper: "ddoga-store-macos.jpg", mode: .screenshots(["store-home.png", "store-scroll.png"])),
    VideoJob(slug: "ddoga-platform", output: "ddoga-platform-macos", phone: false, wallpaper: "ddoga-platform-macos.jpg", mode: .screenshots(["platform-facilities.png", "platform-guides.png"])),
    VideoJob(slug: "ims", output: "ims-macos", phone: false, wallpaper: "ims-macos.jpg", mode: .video(CGRect(x: 329, y: 103, width: 908, height: 511))),
    VideoJob(slug: "care-solution", output: "care-solution-macos", phone: false, wallpaper: "care-solution-macos.jpg", mode: .video(CGRect(x: 329, y: 103, width: 908, height: 511))),
    VideoJob(slug: "care-note", output: "care-note-iphone-v2", phone: true, wallpaper: nil, mode: .video(CGRect(x: 888, y: 35, width: 292, height: 650))),
    VideoJob(slug: "uplus-baseball", output: "uplus-baseball-iphone", phone: true, wallpaper: nil, mode: .baseball)
]

func color(_ hex: UInt32, _ alpha: CGFloat = 1) -> CGColor {
    CGColor(colorSpace: colorSpace, components: [CGFloat((hex >> 16) & 255) / 255, CGFloat((hex >> 8) & 255) / 255, CGFloat(hex & 255) / 255, alpha])!
}
func rectangle(_ x: CGFloat, _ y: CGFloat, _ w: CGFloat, _ h: CGFloat) -> CGRect {
    CGRect(x: x, y: CGFloat(height) - y - h, width: w, height: h)
}
func point(_ x: CGFloat, _ y: CGFloat) -> CGPoint { CGPoint(x: x, y: CGFloat(height) - y) }
func rounded(_ rect: CGRect, _ radius: CGFloat) -> CGPath {
    CGPath(roundedRect: rect, cornerWidth: radius, cornerHeight: radius, transform: nil)
}
func fill(_ context: CGContext, _ rect: CGRect, _ radius: CGFloat, _ hex: UInt32) {
    context.setFillColor(color(hex)); context.addPath(rounded(rect, radius)); context.fillPath()
}
func line(_ context: CGContext, _ points: [CGPoint], _ hex: UInt32 = 0x858782, _ thickness: CGFloat = 1.7) {
    context.setStrokeColor(color(hex)); context.setLineWidth(thickness); context.setLineCap(.round); context.setLineJoin(.round)
    context.addLines(between: points); context.strokePath()
}
func saveJPEG(_ image: CGImage, _ url: URL) throws {
    guard let destination = CGImageDestinationCreateWithURL(url as CFURL, "public.jpeg" as CFString, 1, nil) else { throw RenderError(description: "Cannot create JPEG") }
    CGImageDestinationAddImage(destination, image, [kCGImageDestinationLossyCompressionQuality: 0.94] as CFDictionary)
    guard CGImageDestinationFinalize(destination) else { throw RenderError(description: "Cannot save JPEG") }
}
let safariWindow = rectangle(100, 95, 1400, 840)
let safariContent = rectangle(101, 147, 1398, 787)

func text(_ value: String, _ x: CGFloat, _ baseline: CGFloat, _ size: CGFloat = 14, _ weight: CGFloat = 0) {
    // 메뉴는 시스템 글꼴과 CoreText의 한국어 대체 글꼴로 표시합니다.
    let font = CTFontCreateUIFontForLanguage(.menuItem, size, "ko" as CFString) ?? CTFontCreateWithName("HelveticaNeue" as CFString, size, nil)
    let chosen = weight > 0 ? CTFontCreateCopyWithSymbolicTraits(font, size, nil, .traitBold, .traitBold) ?? font : font
    let attributes: [NSAttributedString.Key: Any] = [NSAttributedString.Key(kCTFontAttributeName as String): chosen, NSAttributedString.Key(kCTForegroundColorAttributeName as String): color(0x292d28)]
    let line = CTLineCreateWithAttributedString(NSAttributedString(string: value, attributes: attributes))
    guard let context = drawingContext else { return }
    context.saveGState(); context.textMatrix = .identity; context.textPosition = point(x, baseline); CTLineDraw(line, context); context.restoreGState()
}
var drawingContext: CGContext?

func loadImage(_ url: URL) throws -> CGImage {
    guard let source = CGImageSourceCreateWithURL(url as CFURL, nil), let image = CGImageSourceCreateImageAtIndex(source, 0, nil) else { throw RenderError(description: "Cannot load image: " + url.path) }
    return image
}
func drawWallpaper(_ context: CGContext, filename: String) throws {
    let url = sourceDirectory.appendingPathComponent("macOS-wallpapers/" + filename)
    let image = try loadImage(url)
    let scale = max(CGFloat(width) / CGFloat(image.width), CGFloat(height) / CGFloat(image.height))
    let w = CGFloat(image.width) * scale, h = CGFloat(image.height) * scale
    context.interpolationQuality = .high
    context.draw(image, in: CGRect(x: (CGFloat(width)-w)/2, y: (CGFloat(height)-h)/2, width: w, height: h))
}
func drawMenuBar(_ context: CGContext) {
    context.setFillColor(color(0xfafcf9, 0.66)); context.fill(rectangle(0, 0, 1600, 36))
    context.setFillColor(color(0xffffff, 0.18)); context.fill(rectangle(0, 35, 1600, 1))
    drawingContext = context
    text("\u{F8FF}", 23, 26, 21)
    text("Safari", 61, 24, 15, 1)
    for (label, x) in [("파일", CGFloat(128)), ("편집", 175), ("보기", 222), ("방문 기록", 269), ("북마크", 351), ("윈도우", 422), ("도움말", 493)] { text(label, x, 24) }
    // Wi-Fi, 배터리, Spotlight, 제어 센터. 날짜는 개인정보와 무관한 고정 시연 값입니다.
    context.setStrokeColor(color(0x353a33)); context.setLineWidth(1.8); context.setLineCap(.round)
    for radius: CGFloat in [11, 7] { context.addArc(center: point(1118, 27), radius: radius, startAngle: .pi * 0.2, endAngle: .pi * 0.8, clockwise: false); context.strokePath() }
    context.setFillColor(color(0x353a33)); context.fillEllipse(in: rectangle(1116.5, 24, 3, 3))
    text("100%", 1144, 24, 12)
    context.setStrokeColor(color(0x353a33)); context.setLineWidth(1.3); context.addPath(rounded(rectangle(1185, 13, 25, 12), 3)); context.strokePath()
    fill(context, rectangle(1188, 16, 19, 6), 1.5, 0x353a33); fill(context, rectangle(1211, 17, 2, 4), 1, 0x353a33)
    context.setLineWidth(1.6); context.strokeEllipse(in: rectangle(1241, 11, 11, 11)); line(context, [point(1250, 21), point(1256, 27)], 0x353a33, 1.6)
    fill(context, rectangle(1281, 11, 21, 6), 3, 0x353a33); fill(context, rectangle(1281, 22, 21, 6), 3, 0x353a33)
    context.setFillColor(color(0xf7faf4)); context.fillEllipse(in: rectangle(1283, 12, 4, 4)); context.fillEllipse(in: rectangle(1296, 23, 4, 4))
    text("11월 18일 (수) 오후 9:41", 1327, 24, 13)
    drawingContext = nil
}
func drawBackdrop(_ context: CGContext, job: VideoJob) throws {
    if !job.phone { try drawWallpaper(context, filename: job.wallpaper!); drawMenuBar(context); return }
    let colors: [CGColor] = job.slug == "care-note" ? [color(0xf4f7ff), color(0xdce7fb)] : [color(0xfff5f9), color(0xe9dced)]
    let gradient = CGGradient(colorsSpace: colorSpace, colors: colors as CFArray, locations: [0, 1])!
    context.drawLinearGradient(gradient, start: point(800, 0), end: point(800, 1000), options: [])
}
func drawSafari(_ context: CGContext, address: String) -> CGRect {
    let window = safariWindow
    context.saveGState(); context.setShadow(offset: CGSize(width: 0, height: -18), blur: 45, color: color(0x162516, 0.25)); fill(context, window, 18, 0xffffff); context.restoreGState()
    context.saveGState(); context.addPath(rounded(window, 18)); context.clip()
    fill(context, rectangle(100, 95, 1400, 52), 0, 0xf4f4f2)
    for (i, hex) in [UInt32(0xfa6057), UInt32(0xf6bf4f), UInt32(0x36c84b)].enumerated() { context.setFillColor(color(hex)); context.fillEllipse(in: rectangle(CGFloat(126 + i * 23), 115, 12, 12)) }
    context.setStrokeColor(color(0x8d918b)); context.setLineWidth(1.6)
    context.stroke(rectangle(220, 113, 17, 16)); line(context, [point(226, 114), point(226, 128)])
    line(context, [point(273, 114), point(266, 121), point(273, 128)])
    line(context, [point(298, 114), point(305, 121), point(298, 128)], 0xb8bbb5)
    fill(context, rectangle(460, 106, 680, 29), 7, 0xe5e7e3)
    let labelStart = 800 - CGFloat(address.count) * 3.4 + 6
    context.setStrokeColor(color(0x7b8277)); context.setLineWidth(1.1)
    context.addPath(rounded(rectangle(labelStart - 17, 117, 8, 8), 1.5)); context.strokePath()
    context.addArc(center: point(labelStart - 13, 117), radius: 3, startAngle: 0, endAngle: .pi, clockwise: false); context.strokePath()
    drawingContext = context; text(address, labelStart, 126, 13); drawingContext = nil
    context.setStrokeColor(color(0x8d918b)); context.stroke(rectangle(1369, 118, 13, 12))
    line(context, [point(1375.5, 123), point(1375.5, 110)]); line(context, [point(1371, 114), point(1375.5, 109.5), point(1380, 114)])
    line(context, [point(1422, 113), point(1422, 129)]); line(context, [point(1414, 121), point(1430, 121)])
    context.setStrokeColor(color(0x8d918b)); context.stroke(rectangle(1458, 113, 15, 13)); context.stroke(rectangle(1463, 118, 15, 13))
    context.restoreGState()
    context.addPath(rounded(window, 18)); context.setLineWidth(1); context.setStrokeColor(color(0x596554, 0.24)); context.strokePath()
    return safariContent
}
func drawPhone(_ context: CGContext) -> CGRect {
    let body = rectangle(592, 42, 416, 916)
    context.saveGState(); context.setShadow(offset: CGSize(width: 0, height: -22), blur: 45, color: color(0x17191d, 0.19)); fill(context, body, 66, 0x222428); context.restoreGState()
    fill(context, rectangle(589, 195, 4, 41), 2, 0x6e7076)
    fill(context, rectangle(589, 257, 4, 66), 2, 0x6e7076)
    fill(context, rectangle(589, 345, 4, 66), 2, 0x6e7076)
    fill(context, rectangle(1007, 274, 4, 105), 2, 0x6e7076)
    context.addPath(rounded(body.insetBy(dx: 2, dy: 2), 64)); context.setStrokeColor(color(0x80828a)); context.setLineWidth(1.1); context.strokePath()
    fill(context, rectangle(599, 49, 402, 902), 60, 0x090a0c)
    fill(context, rectangle(605, 56, 390, 888), 53, 0xffffff)
    return rectangle(605, 108, 390, 808)
}
func drawPhoneDetails(_ context: CGContext) {
    drawingContext = context
    text("9:41", 628, 91, 14, 1)
    drawingContext = nil
    for index in 0..<4 { fill(context, rectangle(895 + CGFloat(index) * 5, 90 - CGFloat(index) * 2.5, 3, 4 + CGFloat(index) * 2.5), 0.8, 0x242728) }
    context.setStrokeColor(color(0x242728)); context.setLineWidth(1.4)
    for radius: CGFloat in [7, 4] { context.addArc(center: point(930, 91), radius: radius, startAngle: .pi * 0.2, endAngle: .pi * 0.8, clockwise: false); context.strokePath() }
    context.setFillColor(color(0x242728)); context.fillEllipse(in: rectangle(928.8, 89, 2.4, 2.4))
    context.setStrokeColor(color(0x242728)); context.setLineWidth(1); context.addPath(rounded(rectangle(947, 81, 21, 10), 2.5)); context.strokePath()
    fill(context, rectangle(950, 84, 15, 4), 1, 0x242728); fill(context, rectangle(969, 84, 1.5, 4), 0.5, 0x242728)
    fill(context, rectangle(740, 70, 120, 29), 14.5, 0x111215)
    fill(context, rectangle(748, 77, 71, 3), 1.5, 0x1f2024)
    context.setFillColor(color(0x202a34)); context.fillEllipse(in: rectangle(840, 79, 9, 9))
    fill(context, rectangle(743, 925, 114, 5), 2.5, 0x191b21)
}
func drawService(_ original: CGImage, into frame: CGRect, context: CGContext, alpha: CGFloat = 1, fillTop: Bool = false) {
    let image: CGImage
    if fillTop {
        let cropHeight = min(CGFloat(original.height), CGFloat(original.width) * frame.height / frame.width)
        image = original.cropping(to: CGRect(x: 0, y: 0, width: original.width, height: Int(cropHeight))) ?? original
    } else { image = original }
    let scale = min(frame.width / CGFloat(image.width), frame.height / CGFloat(image.height))
    let target = CGRect(x: frame.midX - CGFloat(image.width) * scale / 2, y: frame.midY - CGFloat(image.height) * scale / 2, width: CGFloat(image.width) * scale, height: CGFloat(image.height) * scale)
    context.saveGState(); context.clip(to: frame); context.setAlpha(alpha); context.interpolationQuality = .high; context.draw(image, in: target); context.restoreGState()
}
func makeBackplate(job: VideoJob) throws -> (CGImage, CGRect) {
    guard let context = CGContext(data: nil, width: width, height: height, bitsPerComponent: 8, bytesPerRow: 0, space: colorSpace, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue) else { throw RenderError(description: "Cannot create backplate") }
    try drawBackdrop(context, job: job)
    let frame = job.phone ? drawPhone(context) : drawSafari(context, address: job.topFill ? "ddoga.co.kr" : "localhost")
    guard let image = context.makeImage() else { throw RenderError(description: "Cannot cache backplate") }
    return (image, frame)
}
// 메타데이터만 먼저 순회해 빈 꼬리 시간을 제외한 실제 영상 끝을 계산합니다.
func timelineDuration(_ asset: AVAsset, _ track: AVAssetTrack) throws -> Double {
    let scan = try AVAssetReader(asset: asset)
    let samples = AVAssetReaderTrackOutput(track: track, outputSettings: nil)
    scan.add(samples)
    guard scan.startReading() else { throw scan.error ?? RenderError(description: "Cannot inspect video timeline") }
    var first = Double.infinity, ending = 0.0
    let fallback = 1 / max(1, Double(track.nominalFrameRate))
    while let sample = samples.copyNextSampleBuffer() {
        let start = CMTimeGetSeconds(CMSampleBufferGetPresentationTimeStamp(sample))
        let length = CMTimeGetSeconds(CMSampleBufferGetDuration(sample))
        first = min(first, start); ending = max(ending, start + (length.isFinite && length > 0 ? length : fallback))
    }
    guard scan.status == .completed, first.isFinite else { throw scan.error ?? RenderError(description: "Cannot finish video timeline inspection") }
    return max(0.1, ending - first)
}

struct ServiceFrame {
    let base: CGImage
    let overlay: CGImage?
    let opacity: CGFloat
    let seconds: Double
}
func ease(_ value: Double) -> CGFloat { let t = max(0, min(1, value)); return CGFloat(t * t * (3 - 2 * t)) }
func preparedAsset(_ url: URL) throws -> (AVURLAsset, AVAssetTrack) {
    guard FileManager.default.fileExists(atPath: url.path) else { throw RenderError(description: "Missing video: " + url.path) }
    let asset = AVURLAsset(url: url)
    let loaded = DispatchSemaphore(value: 0)
    asset.loadValuesAsynchronously(forKeys: ["duration", "tracks", "playable"]) { loaded.signal() }; loaded.wait()
    var error: NSError?
    guard asset.statusOfValue(forKey: "tracks", error: &error) == .loaded, let track = asset.tracks(withMediaType: .video).first else { throw error ?? RenderError(description: "Cannot load video track") }
    return (asset, track)
}
final class FrameSource {
    let job: VideoJob
    var duration = 10.0
    var reader: AVAssetReader?
    var decoded: AVAssetReaderTrackOutput?
    var plates: [CGImage] = []
    var count = 0
    var firstTime: CMTime?
    init(_ job: VideoJob) throws {
        self.job = job
        switch job.mode {
        case .video:
            let (asset, track) = try preparedAsset(sourceDirectory.appendingPathComponent(job.slug + "-exact.mp4"))
            duration = try timelineDuration(asset, track)
            let reading = try AVAssetReader(asset: asset)
            let output = AVAssetReaderTrackOutput(track: track, outputSettings: [kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA])
            output.alwaysCopiesSampleData = false; reading.add(output)
            guard reading.startReading() else { throw reading.error ?? RenderError(description: "Cannot decode video") }
            reader = reading; decoded = output
        case .screenshots(let filenames):
            plates = try filenames.map { try loadImage(sourceDirectory.appendingPathComponent("macOS-sources/" + $0)) }
        case .baseball:
            let (asset, _) = try preparedAsset(sourceDirectory.appendingPathComponent("uplus-baseball-exact.mp4"))
            let generator = AVAssetImageGenerator(asset: asset); generator.appliesPreferredTrackTransform = true
            generator.requestedTimeToleranceBefore = .zero; generator.requestedTimeToleranceAfter = .zero
            let times = [0.9, 4.3, 8.0]
            let crops = [CGRect(x: 720, y: 66, width: 311, height: 588), CGRect(x: 528, y: 74, width: 299, height: 564), CGRect(x: 473, y: 63, width: 272, height: 524)]
            for i in 0..<3 {
                let image = try generator.copyCGImage(at: CMTime(seconds: times[i], preferredTimescale: 600), actualTime: nil)
                guard let crop = image.cropping(to: crops[i]) else { throw RenderError(description: "Cannot crop baseball app scene") }; plates.append(crop)
            }
        }
    }
    func next() throws -> ServiceFrame? {
        if let decoded = decoded {
            guard let sample = decoded.copyNextSampleBuffer() else {
                guard reader?.status == .completed else { throw reader?.error ?? RenderError(description: "Video decoding incomplete") }; return nil
            }
            let timestamp = CMSampleBufferGetPresentationTimeStamp(sample)
            if firstTime == nil { firstTime = timestamp }
            let seconds = CMTimeGetSeconds(CMTimeSubtract(timestamp, firstTime!))
            guard let pixels = CMSampleBufferGetImageBuffer(sample) else { throw RenderError(description: "Missing decoded frame") }
            let image = CIImage(cvPixelBuffer: pixels)
            guard let full = imageContext.createCGImage(image, from: image.extent) else { throw RenderError(description: "Cannot read decoded frame") }
            guard case .video(let rect) = job.mode, let crop = full.cropping(to: rect) else { throw RenderError(description: "Cannot crop source screen") }
            return ServiceFrame(base: crop, overlay: nil, opacity: 0, seconds: seconds)
        }
        guard count < 250 else { return nil }
        let t = Double(count) / 25; count += 1
        if plates.count == 2 {
            let alpha = t < 4 ? ease((t - 3) / 1) : 1 - ease((t - 8) / 1.7)
            return ServiceFrame(base: plates[0], overlay: plates[1], opacity: alpha, seconds: t)
        }
        if t < 3.3 { return ServiceFrame(base: plates[0], overlay: plates[1], opacity: ease((t - 2.7) / 0.6), seconds: t) }
        if t < 6.6 { return ServiceFrame(base: plates[1], overlay: plates[2], opacity: ease((t - 6) / 0.6), seconds: t) }
        return ServiceFrame(base: plates[2], overlay: plates[0], opacity: ease((t - 9.2) / 0.7), seconds: t)
    }
}
func makePhoneOverlay() throws -> CGImage {
    guard let context = CGContext(data: nil, width: width, height: height, bitsPerComponent: 8, bytesPerRow: 0, space: colorSpace, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue) else { throw RenderError(description: "Cannot create phone overlay") }
    context.clear(CGRect(x: 0, y: 0, width: width, height: height)); drawPhoneDetails(context)
    return context.makeImage()!
}
func drawFrame(_ service: ServiceFrame, job: VideoJob, frame: CGRect, first: CGImage?, duration: Double, context: CGContext) {
    context.saveGState()
    if !job.phone { context.addPath(rounded(safariWindow, 18)); context.clip() }
    drawService(service.base, into: frame, context: context, fillTop: job.topFill)
    if let overlay = service.overlay, service.opacity > 0 { drawService(overlay, into: frame, context: context, alpha: service.opacity, fillTop: job.topFill) }
    if let initial = first {
        let amount = ease((service.seconds - (duration - 0.7)) / 0.6)
        if amount > 0 { drawService(initial, into: frame, context: context, alpha: amount, fillTop: job.topFill) }
    }
    context.restoreGState()
}
func renderPreview(source: URL, job: VideoJob) throws {
    let full = try loadImage(source)
    let service: CGImage
    if case .video(let crop) = job.mode { service = full.cropping(to: crop)! } else { service = full }
    let (backplate, frame) = try makeBackplate(job: job)
    let context = CGContext(data: nil, width: width, height: height, bitsPerComponent: 8, bytesPerRow: 0, space: colorSpace, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
    context.draw(backplate, in: CGRect(x: 0, y: 0, width: width, height: height))
    drawFrame(ServiceFrame(base: service, overlay: nil, opacity: 0, seconds: 0), job: job, frame: frame, first: nil, duration: 10, context: context)
    if job.phone { context.draw(try makePhoneOverlay(), in: CGRect(x: 0, y: 0, width: width, height: height)) }
    try saveJPEG(context.makeImage()!, outputDirectory.appendingPathComponent(job.output + "-preview.jpg"))
    print("Preview saved: " + job.output)
}
func render(_ job: VideoJob) throws {
    print("Rendering: " + job.slug)
    let source = try FrameSource(job)
    let (backplate, frame) = try makeBackplate(job: job)
    let overlay = job.phone ? try makePhoneOverlay() : nil
    let output = outputDirectory.appendingPathComponent(job.output + ".mp4")
    if FileManager.default.fileExists(atPath: output.path) { try FileManager.default.removeItem(at: output) }
    let writer = try AVAssetWriter(outputURL: output, fileType: .mp4)
    let input = AVAssetWriterInput(mediaType: .video, outputSettings: [AVVideoCodecKey: AVVideoCodecType.h264, AVVideoWidthKey: width, AVVideoHeightKey: height, AVVideoCompressionPropertiesKey: [AVVideoAverageBitRateKey: 3500000, AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel, AVVideoMaxKeyFrameIntervalKey: 50]])
    input.expectsMediaDataInRealTime = false; writer.add(input)
    let adapter = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: input, sourcePixelBufferAttributes: [kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA, kCVPixelBufferWidthKey as String: width, kCVPixelBufferHeightKey as String: height, kCVPixelBufferCGImageCompatibilityKey as String: true, kCVPixelBufferCGBitmapContextCompatibilityKey as String: true])
    guard writer.startWriting() else { throw writer.error ?? RenderError(description: "Cannot start encoder") }; writer.startSession(atSourceTime: .zero)
    var first: CGImage?, count = 0, poster = false, diagnostic = 1
    while let service = try source.next() {
        try autoreleasepool {
            if first == nil { first = service.base }
            var buffer: CVPixelBuffer?
            guard let pool = adapter.pixelBufferPool, CVPixelBufferPoolCreatePixelBuffer(nil, pool, &buffer) == kCVReturnSuccess, let pixels = buffer else { throw RenderError(description: "Cannot allocate frame") }
            CVPixelBufferLockBaseAddress(pixels, []); defer { CVPixelBufferUnlockBaseAddress(pixels, []) }
            let context = CGContext(data: CVPixelBufferGetBaseAddress(pixels)!, width: width, height: height, bitsPerComponent: 8, bytesPerRow: CVPixelBufferGetBytesPerRow(pixels), space: colorSpace, bitmapInfo: CGImageAlphaInfo.premultipliedFirst.rawValue | CGBitmapInfo.byteOrder32Little.rawValue)!
            context.draw(backplate, in: CGRect(x: 0, y: 0, width: width, height: height))
            drawFrame(service, job: job, frame: frame, first: first, duration: source.duration, context: context)
            if let overlay = overlay { context.draw(overlay, in: CGRect(x: 0, y: 0, width: width, height: height)) }
            if !poster && service.seconds >= 0.8 { try saveJPEG(context.makeImage()!, outputDirectory.appendingPathComponent(job.output + ".jpg")); poster = true }
            if diagnostic < 3 && service.seconds >= (diagnostic == 1 ? 4.3 : 8) { try saveJPEG(context.makeImage()!, outputDirectory.appendingPathComponent(job.output + "-scene-\(diagnostic + 1).jpg")); diagnostic += 1 }
            while !input.isReadyForMoreMediaData { if writer.status == .failed { throw writer.error! }; Thread.sleep(forTimeInterval: 0.002) }
            guard adapter.append(pixels, withPresentationTime: CMTime(seconds: service.seconds, preferredTimescale: 60000)) else { throw writer.error ?? RenderError(description: "Cannot append frame") }; count += 1
        }
    }
    input.markAsFinished(); let finished = DispatchSemaphore(value: 0); writer.finishWriting { finished.signal() }; finished.wait()
    guard writer.status == .completed else { throw writer.error ?? RenderError(description: "Encoding incomplete") }
    let rendered = AVURLAsset(url: output); let generator = AVAssetImageGenerator(asset: rendered); generator.appliesPreferredTrackTransform = true
    let check = try generator.copyCGImage(at: CMTime(seconds: 4.3, preferredTimescale: 600), actualTime: nil)
    guard check.width == width && check.height == height && rendered.tracks(withMediaType: .audio).isEmpty else { throw RenderError(description: "Output verification failed") }
    let size = (try FileManager.default.attributesOfItem(atPath: output.path)[.size] as? NSNumber)?.intValue ?? 0
    print("\(job.output): \(width)x\(height), \(String(format: "%.3f", CMTimeGetSeconds(rendered.duration)))s, \(count) frames, \(size) bytes, H.264, no audio; decoded frame verified")
}

do {
    try FileManager.default.createDirectory(at: outputDirectory, withIntermediateDirectories: true)
    let only = ProcessInfo.processInfo.environment["PORTFOLIO_RENDER_ONLY"]
    let selected = jobs.filter { only == nil || only == "all" || $0.slug == only }
    guard !selected.isEmpty else { throw RenderError(description: "Unknown render job") }
    if let preview = ProcessInfo.processInfo.environment["PORTFOLIO_PREVIEW_SOURCE"] { try renderPreview(source: URL(fileURLWithPath: preview), job: selected.first!) }
    else { for job in selected { try render(job) } }
} catch { fputs("Device video render failed: \(error)\n", stderr); exit(1) }
