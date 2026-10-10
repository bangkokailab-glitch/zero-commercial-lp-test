import Foundation
import CoreGraphics
import ImageIO

// Join consecutive, unscaled browser screenshot clips. No content is drawn,
// removed, retouched or resized. Arguments: output.jpg tile-0.jpg tile-1.jpg ...
let args = Array(CommandLine.arguments.dropFirst())
guard args.count >= 3 else { fatalError("Expected output and at least two clips") }
let images: [CGImage] = args.dropFirst().map { path in
    guard let source = CGImageSourceCreateWithURL(URL(fileURLWithPath: path) as CFURL, nil),
          let image = CGImageSourceCreateImageAtIndex(source, 0, nil) else {
        fatalError("Could not decode \(path)")
    }
    return image
}
let width = images[0].width
let height = images.reduce(0) { $0 + $1.height }
guard images.allSatisfy({ $0.width == width }),
      let colorSpace = CGColorSpace(name: CGColorSpace.sRGB),
      let context = CGContext(data: nil, width: width, height: height,
                              bitsPerComponent: 8, bytesPerRow: width * 4,
                              space: colorSpace,
                              bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue) else {
    fatalError("Mismatched clip widths or bitmap allocation failed")
}
context.interpolationQuality = .none
var top = 0
for image in images {
    context.draw(image, in: CGRect(x: 0, y: height - top - image.height,
                                   width: width, height: image.height))
    top += image.height
}
guard let output = context.makeImage(),
      let destination = CGImageDestinationCreateWithURL(
        URL(fileURLWithPath: args[0]) as CFURL, "public.jpeg" as CFString, 1, nil) else {
    fatalError("Could not create output")
}
CGImageDestinationAddImage(destination, output,
    [kCGImageDestinationLossyCompressionQuality: 0.98] as CFDictionary)
guard CGImageDestinationFinalize(destination) else { fatalError("Could not save output") }
print("Joined \(images.count) consecutive clips: \(width) × \(height)")
