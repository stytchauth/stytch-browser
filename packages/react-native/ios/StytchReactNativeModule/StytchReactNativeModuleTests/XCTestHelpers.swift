//
//  XCTestHelpers.swift
//  StytchReactNativeModuleTests
//
//  Created by Jordan Haven on 11/4/23.
//

import Foundation
import XCTest

internal func XCTAssertEqualJSON(_ value1: JSON, _ value2: JSON, file: StaticString = #file, line: UInt = #line) {
    guard let message = value2.difference(from: value1) else { return }
    XCTFail("JSON differed:\n" + message, file: file, line: line)
}

internal extension JSON {
    func difference(from other: JSON?) -> String? {
        switch (self, other) {
        case let (.object(lhs), .object(rhs)):
            let lhsKeys = lhs.keys.sorted()
            if let description = lhsKeys.difference(from: rhs.keys.sorted()).testDescription(descriptor: "key") {
                return description
            } else {
                for key in lhsKeys {
                    if let description = lhs[key]?.difference(from: rhs[key]) {
                        return description
                    }
                }
            }
            return nil
        case let (.array(lhs), .array(rhs)):
            return lhs.difference(from: rhs).testDescription(descriptor: "value")
        case let (.number(lhs), .number(rhs)):
            return lhs != rhs ? "\(lhs) != \(rhs)" : nil
        case let (.boolean(lhs), .boolean(rhs)):
            return lhs != rhs ? "\(lhs) != \(rhs)" : nil
        case let (.string(lhs), .string(rhs)):
            return lhs.difference(from: rhs).testDescription(descriptor: "character").map { "\(lhs) != \(rhs)\n" + $0 }
        default:
            return "\(self) != \(other ?? "nil")"
        }
    }
}

internal extension CollectionDifference {
    func testDescription(descriptor: String) -> String? {
        guard case let descriptions = compactMap({ $0.testDescription(descriptor: descriptor) }), !descriptions.isEmpty else { return nil }

        return "- " + descriptions.joined(separator: "\n- ")
    }
}

internal extension CollectionDifference.Change {
    func testDescription(descriptor: String) -> String? {
        switch self {
        case let .insert(index, element, association):
            if let oldIndex = association {
                return "Element moved from index \(oldIndex) to \(index): \(element)"
            } else {
                return "Expected \(descriptor) missing: \(element)"
            }
        case let .remove(_, element, association):
            guard association == nil else {
                return nil
            }

            return "Unexpected \(descriptor) present: \(element)"
        }
    }
}

