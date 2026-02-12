#!/usr/bin/env python3
"""
くまの酒店 — 領収書作成スクリプト（所定フォーマット Style F）

使い方:
  このファイルの末尾にある data 辞書を編集して実行するだけで、
  所定フォーマットの領収書PDFが生成されます。

  python3 領収書作成.py
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor, Color
import os, sys, datetime

# ── フォント登録 ──
FONT_PATH = "/usr/share/fonts/truetype/droid/DroidSansFallbackFull.ttf"
pdfmetrics.registerFont(TTFont("JP", FONT_PATH))
NF  = "Helvetica"
NFB = "Helvetica-Bold"

W, H = A4

# ── 店舗情報（固定） ──
SHOP = {
    "name":         "くまの酒店",
    "addr":         "東京都世田谷区経堂2-15-8",
    "tel":          "03-3429-5500",
    "registration": "T1234567890123",
    "stamp":        ["くまの", "酒店"],
    "accent":       "#1b4332",
    "accent2":      "#2d6a4f",
}


# ====================================================================
# ユーティリティ
# ====================================================================
def fmt(n):
    """数値をカンマ区切り文字列にする"""
    return f"{n:,}"

def draw_segs(c, x, y, segs, anchor="left"):
    """[(text, font, size), ...] を描画。anchor: left / right / center"""
    tw = sum(c.stringWidth(t, f, s) for t, f, s in segs)
    cx = x - tw if anchor == "right" else (x - tw / 2 if anchor == "center" else x)
    for t, f, s in segs:
        c.setFont(f, s)
        c.drawString(cx, y, t)
        cx += c.stringWidth(t, f, s)

def mixed_segs(text, size):
    """日本語と英数字が混在する文字列を自動分割してセグメントリストを返す"""
    segs, buf, is_ascii = [], "", None
    for ch in str(text):
        cur = ord(ch) < 128
        if is_ascii is not None and cur != is_ascii:
            segs.append((buf, NF if is_ascii else "JP", size))
            buf = ""
        buf += ch
        is_ascii = cur
    if buf:
        segs.append((buf, NF if is_ascii else "JP", size))
    return segs

def draw_stamp(c, x, y, lines, r=11*mm, color=HexColor("#cc3333")):
    """丸印鑑を描画"""
    c.saveState()
    c.setStrokeColor(color); c.setLineWidth(1.8)
    c.setFillColor(Color(0.8, 0.2, 0.2, alpha=0.08))
    c.circle(x, y, r, fill=1, stroke=1)
    c.setLineWidth(0.7)
    c.circle(x, y, r - 2*mm, fill=0, stroke=1)
    c.setFont("JP", 7); c.setFillColor(color)
    lh = 3.8*mm
    sy = y + (len(lines)-1)*lh/2
    for i, ln in enumerate(lines):
        c.drawCentredString(x, sy - i*lh, ln)
    c.restoreState()


# ====================================================================
# 領収書 PDF 生成（Style F: 自店フォーマット）
# ====================================================================
def create_receipt(data, output_path):
    """
    data (dict) の必須キー:
        to       : 宛名（例: "居酒屋 鶴亀"）
        date     : 日付 (datetime.date or "YYYY-MM-DD" 文字列)
        no       : 伝票番号（例: "KS-2026-0301"）
        amount   : 税込金額 (int)
        tax      : 消費税額 (int)
        desc     : 但し書き（例: "酒類卸売代金（3月第1回納品分）"）

    data (dict) の任意キー:
        items    : 明細リスト [{"name": str, "qty": str, "price": int}, ...]
                   省略時は明細なしの領収書になる
    """
    accent  = HexColor(SHOP["accent"])
    accent2 = HexColor(SHOP["accent2"])

    # 日付パース
    d = data["date"]
    if isinstance(d, str):
        d = datetime.date.fromisoformat(d)
    date_y, date_m, date_d = str(d.year), str(d.month), str(d.day)

    c = canvas.Canvas(output_path, pagesize=A4)

    # 背景
    c.setFillColor(HexColor("#ffffff"))
    c.rect(0, 0, W, H, fill=1, stroke=0)

    # ── 上部アクセント帯 ──
    c.setFillColor(accent)
    c.rect(0, H - 8*mm, W, 8*mm, fill=1, stroke=0)
    c.setFillColor(accent2)
    c.rect(0, H - 10*mm, W, 2*mm, fill=1, stroke=0)

    # ── 店名ロゴエリア（左上） ──
    c.setFont("JP", 9); c.setFillColor(HexColor("#777777"))
    c.drawString(20*mm, H - 22*mm, SHOP["name"])
    c.setFont("JP", 7); c.setFillColor(HexColor("#999999"))
    c.drawString(20*mm, H - 27*mm, SHOP["addr"])
    draw_segs(c, 20*mm, H - 32*mm, [("TEL: ", NF, 7), (SHOP["tel"], NF, 7)])
    c.setFont(NF, 6); c.setFillColor(HexColor("#aaaaaa"))
    c.drawString(20*mm, H - 37*mm, SHOP["registration"])

    # ── タイトル（右上） ──
    c.setFont("JP", 28); c.setFillColor(accent)
    c.drawRightString(W - 20*mm, H - 25*mm, "領収書")

    # ── 水平線 ──
    c.setStrokeColor(accent); c.setLineWidth(1)
    c.line(20*mm, H - 42*mm, W - 20*mm, H - 42*mm)

    # ── 番号・日付 ──
    c.setFillColor(HexColor("#888888"))
    draw_segs(c, W - 20*mm, H - 48*mm,
              [("No. ", NF, 9), (data["no"], NF, 9)], "right")
    draw_segs(c, W - 20*mm, H - 54*mm, [
        ("発行日: ", "JP", 9), (date_y, NF, 9), ("年", "JP", 9),
        (date_m, NF, 9), ("月", "JP", 9), (date_d, NF, 9), ("日", "JP", 9),
    ], "right")

    # ── 宛名 ──
    ry = H - 65*mm
    c.setFont("JP", 15); c.setFillColor(HexColor("#222222"))
    c.drawString(20*mm, ry, f"{data['to']}　様")
    c.setStrokeColor(HexColor("#333333")); c.setLineWidth(0.7)
    c.line(20*mm, ry - 4*mm, 110*mm, ry - 4*mm)

    # ── 金額ボックス ──
    ay = ry - 22*mm
    c.setFillColor(accent)
    c.rect(20*mm, ay - 3*mm, W - 40*mm, 15*mm, fill=1, stroke=0)
    c.setFont("JP", 11); c.setFillColor(HexColor("#ffffff"))
    c.drawString(25*mm, ay + 4*mm, "ご請求金額")
    draw_segs(c, W - 25*mm, ay + 2*mm, [
        ("¥ ", NFB, 20), (fmt(data["amount"]), NFB, 22),
    ], "right")

    excl = data["amount"] - data["tax"]
    c.setFillColor(HexColor("#777777"))
    draw_segs(c, W - 25*mm, ay - 9*mm, [
        ("（税抜 ", "JP", 8), ("¥", NF, 8), (fmt(excl), NF, 8),
        ("　消費税 ", "JP", 8), ("¥", NF, 8), (fmt(data["tax"]), NF, 8),
        ("）", "JP", 8),
    ], "right")

    # ── 但し書き ──
    dy = ay - 22*mm
    c.setFont("JP", 10); c.setFillColor(HexColor("#555555"))
    c.drawString(20*mm, dy, "但し")
    c.setFillColor(HexColor("#222222"))
    draw_segs(c, 34*mm, dy, mixed_segs(data["desc"] + "　として", 11))
    c.setStrokeColor(HexColor("#dddddd")); c.setLineWidth(0.3)
    c.line(34*mm, dy - 3*mm, W - 20*mm, dy - 3*mm)

    # ── 明細（あれば） ──
    if "items" in data and data["items"]:
        iy = dy - 16*mm
        c.setStrokeColor(accent); c.setLineWidth(0.6)
        c.line(20*mm, iy + 5*mm, W - 20*mm, iy + 5*mm)
        c.setFont("JP", 8); c.setFillColor(accent)
        c.drawString(22*mm, iy, "品名")
        c.drawRightString(130*mm, iy, "数量")
        c.drawRightString(W - 22*mm, iy, "金額")
        c.setLineWidth(0.3)
        c.line(20*mm, iy - 3*mm, W - 20*mm, iy - 3*mm)
        cy = iy - 10*mm
        for item in data["items"]:
            c.setFont("JP", 9); c.setFillColor(HexColor("#333333"))
            c.drawString(22*mm, cy, item["name"])
            draw_segs(c, 130*mm, cy, mixed_segs(item["qty"], 9), "right")
            draw_segs(c, W - 22*mm, cy,
                      [("¥", NF, 8), (fmt(item["price"]), NF, 9)], "right")
            c.setStrokeColor(HexColor("#eeeeee")); c.setLineWidth(0.2)
            c.line(20*mm, cy - 3*mm, W - 20*mm, cy - 3*mm)
            cy -= 8*mm

    # ── 領収文 ──
    c.setFont("JP", 9); c.setFillColor(HexColor("#888888"))
    c.drawString(20*mm, 95*mm, "上記の金額を正に領収いたしました。")

    # ── 印鑑 ──
    draw_stamp(c, W - 45*mm, 80*mm, SHOP["stamp"], color=accent)

    # ── 下部帯 ──
    c.setFillColor(accent)
    c.rect(0, 0, W, 5*mm, fill=1, stroke=0)

    c.save()
    print(f"✓ 作成完了: {output_path}")


# ====================================================================
# ★ ここを編集して領収書を作成 ★
# ====================================================================
if __name__ == "__main__":

    OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))

    data = {
        "to":     "サンプル商事株式会社",       # 宛名
        "date":   "2026-02-15",                  # 日付（YYYY-MM-DD）
        "no":     "KS-2026-0220",                # 伝票番号
        "amount": 55000,                         # 税込金額
        "tax":    5000,                          # うち消費税
        "desc":   "酒類卸売代金（2月第2回納品分）",  # 但し書き

        # 明細（不要なら items ごと削除してOK）
        "items": [
            {"name": "獺祭 純米大吟醸45 720ml",  "qty": "6本",     "price": 19800},
            {"name": "黒霧島 芋焼酎 1.8L",       "qty": "4本",     "price": 8800},
            {"name": "プレミアムモルツ 350ml",     "qty": "2ケース", "price": 11800},
            {"name": "梅酒 紀州 720ml",           "qty": "4本",     "price": 5200},
            {"name": "配送料",                    "qty": "1式",     "price": 4400},
        ],
    }

    filename = f"{data['no']}_{data['to'].replace(' ', '')}.pdf"
    output_path = os.path.join(OUTPUT_DIR, filename)

    create_receipt(data, output_path)
