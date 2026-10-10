/**
 * Minimal TextMate grammar for P4-16.
 *
 * Shiki ships no `p4` grammar, so until now every ```p4 block in this blog fell
 * back to plain text with no highlighting at all. This grammar is deliberately
 * small — it covers the syntax used by the tutorial posts (headers, parsers,
 * tables, actions, V1Model plumbing) rather than the whole specification.
 */
export const p4Grammar = {
  name: 'p4',
  scopeName: 'source.p4',
  displayName: 'P4',
  patterns: [
    { include: '#comments' },
    { include: '#strings' },
    { include: '#numbers' },
    { include: '#annotations' },
    { include: '#controlKeywords' },
    { include: '#declarationKeywords' },
    { include: '#constants' },
    { include: '#primitiveTypes' },
    { include: '#builtins' },
    { include: '#functions' }
  ],
  repository: {
    comments: {
      patterns: [
        {
          name: 'comment.line.double-slash.p4',
          match: '//.*$'
        },
        {
          name: 'comment.block.p4',
          begin: '/\\*',
          end: '\\*/'
        }
      ]
    },
    strings: {
      patterns: [
        {
          name: 'string.quoted.double.p4',
          begin: '"',
          end: '"',
          patterns: [
            {
              name: 'constant.character.escape.p4',
              match: '\\\\.'
            }
          ]
        }
      ]
    },
    numbers: {
      patterns: [
        {
          name: 'constant.numeric.p4',
          match: '\\b(?:0[xX][0-9a-fA-F_]+|0[bB][01_]+|\\d[\\d_]*(?:\\.\\d+)?)\\b'
        }
      ]
    },
    annotations: {
      patterns: [
        {
          name: 'storage.type.annotation.p4',
          match: '@[A-Za-z_][A-Za-z0-9_]*'
        }
      ]
    },
    controlKeywords: {
      patterns: [
        {
          name: 'keyword.control.p4',
          match: '\\b(?:if|else|return|exit|select|transition)\\b'
        }
      ]
    },
    declarationKeywords: {
      patterns: [
        {
          name: 'keyword.other.p4',
          match:
            '\\b(?:action|actions|apply|const|control|default_action|entries|enum|extern|header|in|inout|key|match_kind|out|package|parser|size|state|struct|table|this|tuple|type|typedef|verify|direct_counter|direct_meter|counters|meters|implementation|default|true|false|abstract|newtype)\\b'
        }
      ]
    },
    constants: {
      patterns: [
        {
          name: 'constant.language.p4',
          match: '\\b(?:exact|ternary|lpm|range|optional|NoAction|drop|_table|_match|_action)\\b'
        }
      ]
    },
    primitiveTypes: {
      patterns: [
        {
          name: 'storage.type.p4',
          match: '\\b(?:bit|varbit|int|bool|void|error|string|packet_in|packet_out)\\b'
        }
      ]
    },
    builtins: {
      patterns: [
        {
          name: 'support.type.p4',
          match:
            '\\b(?:standard_metadata|standard_metadata_t|ingress|egress|v1model|V1Switch|hdr|meta|HashAlgorithm|CounterType|MeterType|checksum16|mark_to_drop|truncate|clone|recirculate|resubmit)\\b'
        }
      ]
    },
    functions: {
      patterns: [
        {
          name: 'entity.name.function.p4',
          match: '\\b[A-Za-z_][A-Za-z0-9_]*(?=\\s*\\()'
        }
      ]
    }
  }
}

export default p4Grammar
