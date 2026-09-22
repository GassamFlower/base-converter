// app.js — Base Converter 领域逻辑（唯一换算入口）
// 依据宪法：所有进制换算必须走这里的 convert()，禁止各处自写实现。
"use strict";

(function (global) {
  "use strict";

  const DIGITS = "0123456789abcdef";

  /**
   * 把字符串按 fromRadix 解析为 BigInt。
   * 兼容：大小写 hex、可选的 0x/0b/0o 前缀、可选的负号。
   * 非法字符抛 message='invalid'，空输入抛 'empty'，否则返回 bigint。
   */
  function parseRaw(raw, fromRadix, opts) {
    let s = String(raw == null ? "" : raw).trim();
    const allowPrefix = !!(opts && opts.allowPrefix);
    let negative = false;
    if (s.startsWith("-")) { negative = true; s = s.slice(1); }
    if (allowPrefix) {
      if (fromRadix === 16 && /^0x/i.test(s)) s = s.slice(2);
      else if (fromRadix === 2 && /^0b/i.test(s)) s = s.slice(2);
      else if (fromRadix === 8 && /^0o/i.test(s)) s = s.slice(2);
    }
    if (s === "") throw "empty";
    const allowed = DIGITS.slice(0, fromRadix);
    const lower = s.toLowerCase();
    for (const ch of lower) {
      if (allowed.indexOf(ch) === -1) throw "invalid";
    }
    let value = 0n;
    const radix = BigInt(fromRadix);
    for (const ch of lower) {
      value = value * radix + BigInt(allowed.indexOf(ch));
    }
    return negative ? -value : value;
  }

  /**
   * 把 bigint 表示成 toRadix 进制字符串（含负号前缀，绝对值表示）。
   */
  function toRadixString(value, toRadix) {
    if (value === 0n) return "0";
    const negative = value < 0n;
    let v = negative ? -value : value;
    const radix = BigInt(toRadix);
    let out = "";
    while (v > 0n) {
      out = DIGITS[Number(v % radix)] + out;
      v = v / radix;
    }
    return (negative ? "-" : "") + out;
  }

  /**
   * 核心转换入口（架构文档：唯一换算逻辑）。
   * @param {string} raw       待转换字符串
   * @param {number} fromRadix 输入进制 2|8|10|16
   * @param {number} toRadix   目标进制 2|8|10|16
   * @param {object} opts
   *   - allowPrefix(bool): 是否容忍 0x/0b/0o 前缀
   * @returns {object} { ok, value(bigint十进制串), neg, from, to, out }
   * @throws 抛 ''invalid'' / 'empty'
   */
  function convert(raw, fromRadix, toRadix, opts) {
    const value = parseRaw(raw, fromRadix, { allowPrefix: !!(opts && opts.allowPrefix) });
    return {
      ok: true,
      value: value.toString(10),
      neg: value < 0n,
      from: fromRadix,
      to: toRadix,
      out: toRadixString(value, toRadix),
    };
  }

  global.BC = { convert, parseRaw, toRadixString, DIGITS };
})(window);