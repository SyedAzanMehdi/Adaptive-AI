"""Rebuild the pitch decks (05 Overview, 07 Investor, 09 Hackathon, 15 Competition Pitch, 16 University Pitch).

Monochrome black & white styling matching the product. Run from repo root:
    python scripts/build_decks.py            # build all decks
    python scripts/build_decks.py pitch      # build only docs/15
    python scripts/build_decks.py university # build only docs/16 (overview|investor|hackathon|pitch|university)
"""
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from lxml import etree

WHITE = RGBColor(0xFF, 0xFF, 0xFF)
BLACK = RGBColor(0x0A, 0x0A, 0x0A)
GRAY_DARK = RGBColor(0x44, 0x44, 0x44)
GRAY_MID = RGBColor(0x66, 0x66, 0x66)
GRAY_LIGHT = RGBColor(0xE5, 0xE5, 0xE5)
FONT = "Calibri"

SLIDE_W = Inches(13.333)
SLIDE_H = Inches(7.5)


def new_deck():
    prs = Presentation()
    prs.slide_width = SLIDE_W
    prs.slide_height = SLIDE_H
    return prs


def blank(prs, bg=WHITE):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    fill = slide.background.fill
    fill.solid()
    fill.fore_color.rgb = bg
    return slide


def box(slide, x, y, w, h):
    tb = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = tb.text_frame
    tf.word_wrap = True
    return tf


def line(tf, text, size=14, color=BLACK, bold=False, first=False, align=PP_ALIGN.LEFT, space_after=6):
    p = tf.paragraphs[0] if first else tf.add_paragraph()
    p.alignment = align
    p.space_after = Pt(space_after)
    r = p.add_run()
    r.text = text
    r.font.size = Pt(size)
    r.font.bold = bold
    r.font.color.rgb = color
    r.font.name = FONT
    return p


def kicker(slide, text, dark=False):
    tf = box(slide, 0.7, 0.45, 12, 0.4)
    line(tf, text.upper(), size=12, color=WHITE if dark else GRAY_MID, bold=True, first=True)


def title(slide, text, dark=False):
    tf = box(slide, 0.7, 0.85, 12, 1.0)
    line(tf, text, size=30, color=WHITE if dark else BLACK, bold=True, first=True)
    bar = slide.shapes.add_shape(1, Inches(0.72), Inches(1.75), Inches(0.9), Pt(3))
    bar.fill.solid()
    bar.fill.fore_color.rgb = WHITE if dark else BLACK
    bar.line.fill.background()


def bullets(slide, items, x=0.7, y=2.0, w=11.9, h=5.0, size=15, dark=False, gap=10):
    tf = box(slide, x, y, w, h)
    for i, item in enumerate(items):
        if isinstance(item, tuple):
            head, body = item
            p = line(tf, head, size=size, color=WHITE if dark else BLACK, bold=True,
                     first=(i == 0), space_after=2)
            p2 = line(tf, body, size=size - 2, color=GRAY_LIGHT if dark else GRAY_DARK,
                      space_after=gap)
        else:
            line(tf, "•  " + item, size=size, color=WHITE if dark else BLACK,
                 first=(i == 0), space_after=gap)


def card(slide, x, y, w, h, head, body, inverted=False):
    shp = slide.shapes.add_shape(1, Inches(x), Inches(y), Inches(w), Inches(h))
    shp.fill.solid()
    shp.fill.fore_color.rgb = BLACK if inverted else WHITE
    shp.line.color.rgb = BLACK
    shp.line.width = Pt(1.25)
    shp.shadow.inherit = False
    tf = shp.text_frame
    tf.word_wrap = True
    tf.margin_left = Inches(0.22)
    tf.margin_right = Inches(0.22)
    tf.margin_top = Inches(0.18)
    tf.vertical_anchor = MSO_ANCHOR.TOP
    p = tf.paragraphs[0]
    r = p.add_run()
    r.text = head
    r.font.size = Pt(14)
    r.font.bold = True
    r.font.color.rgb = WHITE if inverted else BLACK
    r.font.name = FONT
    p.space_after = Pt(4)
    p2 = tf.add_paragraph()
    r2 = p2.add_run()
    r2.text = body
    r2.font.size = Pt(11.5)
    r2.font.color.rgb = GRAY_LIGHT if inverted else GRAY_DARK
    r2.font.name = FONT


def footer(slide, text, dark=False):
    tf = box(slide, 0.7, 7.05, 12, 0.35)
    line(tf, text, size=10, color=GRAY_MID if not dark else RGBColor(0x99, 0x99, 0x99), first=True)


def title_slide(prs, kicker_text, main, sub, credit, credit2=None):
    s = blank(prs, BLACK)
    tf = box(s, 0.9, 1.5, 11.5, 0.5)
    line(tf, kicker_text.upper(), size=14, color=RGBColor(0xAA, 0xAA, 0xAA), bold=True, first=True)
    tf = box(s, 0.9, 2.1, 11.5, 2.2)
    line(tf, main, size=44, color=WHITE, bold=True, first=True, space_after=10)
    line(tf, sub, size=18, color=RGBColor(0xCC, 0xCC, 0xCC))
    bar = s.shapes.add_shape(1, Inches(0.95), Inches(4.9), Inches(1.2), Pt(3))
    bar.fill.solid()
    bar.fill.fore_color.rgb = WHITE
    bar.line.fill.background()
    tf = box(s, 0.9, 6.25 if credit2 else 6.6, 11.5, 0.9 if credit2 else 0.5)
    line(tf, credit, size=12, color=RGBColor(0x99, 0x99, 0x99), first=True)
    if credit2:
        line(tf, credit2, size=12, color=RGBColor(0x99, 0x99, 0x99))


ATTR = "Created by Syed Azan Mehdi Shah — AI-Driven Adaptive Learning Platform"


def build_overview():
    prs = new_deck()
    title_slide(
        prs,
        "AI-Driven Adaptive Education",
        "Adaptive AI Learning Platform",
        "Personalized computer-science education that predicts forgetting, profiles struggle, and turns learning into opportunity.",
        ATTR,
    )

    s = blank(prs)
    kicker(s, "The Core Problem")
    title(s, "Static courses fail almost everyone")
    bullets(s, [
        ("One-size-fits-all content", "Every learner sees the same lessons regardless of strength, weakness, or style — so most disengage."),
        ("No memory of forgetting", "Platforms record what you completed, not what you retained. Skills silently decay after assessment."),
        ("No path to outcomes", "Learning stops at 'course finished' — students still can't answer interviews, prove skills abroad, or land first clients."),
        ("Our answer", "A live AI tutor: adaptive diagnostics build a Capability Matrix, lessons rewrite themselves per learner, and an opportunity layer converts skill into scholarships, jobs, and income."),
    ])
    footer(s, ATTR)

    s = blank(prs)
    kicker(s, "Adaptive Engine")
    title(s, "The learning loop")
    bullets(s, [
        ("Adaptive diagnostics", "Gemini-generated questions adapt to every answer; correct answers never leave the server. Compiles a 5-domain Capability Matrix."),
        ("Self-rewriting lessons", "Analogies for beginners, diagrams for intermediates, internals for advanced — same objectives, personalized delivery, cached per concept × tier × style."),
        ("4-axis code mentorship", "Correctness, style, edge cases, optimization — tiered feedback that feeds the matrix and Struggle DNA with every submission."),
        ("Domain-general AI mentor", "Persistent per-user chat with topic tagging, graceful knowledge-base fallback, strict history isolation."),
    ])
    footer(s, ATTR)

    s = blank(prs)
    kicker(s, "Signature Innovations")
    title(s, "Capabilities no incumbent ships")
    card(s, 0.7, 2.0, 5.9, 2.3, "Memory Twin™ — skill-decay prediction",
         "Fits forgetting curves R(t)=e^(−t/S) to real practice history; 14-day retention forecast; 2-minute Rescue Reviews reinforce stability before skills fade.")
    card(s, 6.75, 2.0, 5.9, 2.3, "Struggle DNA™ — cognitive phenotyping",
         "Mines behavior into Resilience, Depth Tolerance, Edge Awareness, Craft; assigns a struggle archetype and prescribes targeted countermeasures.")
    card(s, 0.7, 4.5, 5.9, 2.3, "Career Autopilot™ — JD → fit % + 90-day plan",
         "Paste any job description: importance-weighted fit score against the live matrix, a Recruiter Lens screen-out risk, and a deterministic 90-day plan.")
    card(s, 6.75, 4.5, 5.9, 2.3, "System Design Dojo™ — interview training",
         "Six structured challenges graded on a 4-axis interview rubric (Clarify → Estimate → Model → Architect → Scale) with AI critique and history.")
    footer(s, ATTR)

    s = blank(prs)
    kicker(s, "New — Career Readiness Stack")
    title(s, "From 'what do I need?' to 'I got the offer'")
    card(s, 0.7, 2.0, 5.9, 2.3, "Automated Assessment Generator™",
         "Turns the gap report into a 3-12 item suite — quiz, coding, or interview probes — where each item targets exactly one weak requirement.")
    card(s, 6.75, 2.0, 5.9, 2.3, "Learning Path + Time-to-Ready ETA™",
         "A priority-ordered study plan with hour estimates and curated resources, converted into a job-ready date from a student-set weekly-hours slider.")
    card(s, 0.7, 4.5, 5.9, 2.3, "Interview Rehearsal Studio™ — free",
         "A role-specific mock loop (screening, technical, design, behavioural) with a timed self-scorecard and a cross-session improvement trend.")
    card(s, 6.75, 4.5, 5.9, 2.3, "Application Pipeline™ — free",
         "A 6-stage tracker (Saved → Offer) that computes response rate server-side, excluding Saved rows so the number stays honest.")
    footer(s, ATTR)

    s = blank(prs)
    kicker(s, "New — Opportunity Layer")
    title(s, "From learning to outcomes")
    card(s, 0.7, 2.0, 5.9, 4.6, "AI-Resilience Score™",
         "Computed from the student's own Capability Matrix against a curated, periodically-updated view of what AI can already automate — an overall resilience score, the most-exposed skill, and a pivot path to the lowest-exposure domain they haven't yet mastered.")
    card(s, 6.75, 2.0, 5.9, 4.6, "Freelance Launchpad™",
         "AI-drafted, matrix-grounded freelance profile — niche, skills, starter gigs, realistic rate. Copy straight to any marketplace; never invents skills.")
    footer(s, ATTR)

    s = blank(prs, BLACK)
    kicker(s, "Architecture & Reliability", dark=True)
    title(s, "Demo-proof by design", dark=True)
    bullets(s, [
        ("MERN + TypeScript monorepo", "React 19 + Vite, Express 5 strict MVC, Mongoose, shared Zod schemas; AI isolated in a dedicated services layer."),
        ("Structured outputs everywhere", "Every Gemini call declares a response schema and validates before persistence; deterministic mock fallback keeps every feature alive with zero API keys."),
        ("Production security", "Issuer-bound JWT, RBAC + plan gating (403/402), helmet CSP + HSTS, tiered rate limits, audit logging."),
        ("Verified quality", "113/113 automated tests, 53/53 live API QA checks, WCAG-AA contrast audit on every route in dark + light."),
    ], dark=True)
    footer(s, ATTR, dark=True)

    prs.save("docs/05_Platform_Overview.pptx")
    print("OK docs/05_Platform_Overview.pptx (7 slides)")


def build_investor():
    prs = new_deck()
    title_slide(
        prs,
        "Adaptive+ Investor Pitch",
        "The retention engine for online CS education",
        "Memory modeling + struggle phenotyping + an opportunity layer that converts learning into scholarships, jobs, and income.",
        ATTR,
    )

    s = blank(prs)
    kicker(s, "Market Opportunity")
    title(s, "A $300B+ gap with a retention crisis")
    bullets(s, [
        ("Massive churn", "Over 90% of students drop out of static video-based CS courses; completion is the industry's unsolved problem."),
        ("Emerging-market surge", "Pakistan, India, MENA, Southeast Asia hold the next billion learners — underserved by US-priced, English-only products."),
        ("Outcomes are the product", "Students pay for results: passing interviews, studying abroad, first freelance income. Nobody connects learning evidence to those outcomes."),
    ])
    footer(s, ATTR)

    s = blank(prs)
    kicker(s, "Product Differentiation")
    title(s, "Why Adaptive+ wins")
    card(s, 0.7, 2.0, 5.9, 2.3, "Memory Twin™ retention engine",
         "Students watch their own skills fade on a forecast chart — then subscribe to stop it. Loss-aversion monetization built into the product.")
    card(s, 6.75, 2.0, 5.9, 2.3, "Struggle DNA™ profiler",
         "Coaches WHY students keep failing, not just what they missed — the moat compounds with every answer recorded.")
    card(s, 0.7, 4.5, 5.9, 2.3, "Career Readiness Stack™ killer demo",
         "Paste any JD → fit % + 90-day plan, then the same gap report drives a targeted assessment, a rehearsal with a scorecard, and a tracked response rate. One pasted JD, five compounding outputs, a natural premium upsell.")
    card(s, 6.75, 4.5, 5.9, 2.3, "Demo-proof architecture",
         "Every AI path has a structured schema + deterministic fallback — the live demo can never fail on stage or in diligence.")
    footer(s, ATTR)

    s = blank(prs)
    kicker(s, "New — The Opportunity Layer")
    title(s, "Why students come back without a paywall")
    bullets(s, [
        ("AI-Resilience Score™", "Computed from the student's own Capability Matrix against a curated, evolving view of what AI already automates — a score, a most-exposed skill, and a concrete pivot path. No competitor personalizes an automation forecast to measured skill."),
        ("Freelance Launchpad™", "Turns the Capability Matrix into a marketplace-ready profile with starter gigs and realistic rates — income is the strongest retention mechanic."),
        ("Interview Rehearsal Studio™ + Application Pipeline™", "Free mock-interview loop with a scored trend, and a 6-stage application tracker with an honest server-computed response rate — both drive daily return visits without a paywall."),
    ])
    footer(s, ATTR)

    s = blank(prs)
    kicker(s, "Monetization & Traction Path")
    title(s, "Freemium that sells itself")
    bullets(s, [
        ("Explorer (Free)", "Diagnostic, adaptive lessons, playground, Dojo, AI-Resilience Score, Freelance — the opportunity layer is free by design: it acquires and retains."),
        ("Adaptive+ (Premium)", "Memory Twin™, Rescue Reviews, full Struggle DNA™, Career Autopilot™. Gated server-side via JWT plan claims (402), not UI tricks."),
        ("Conversion hook", "Free users watch their skills decay on a chart, then subscribe to stop it — an emotional event the product creates on its own."),
        ("Roadmap", "Stripe billing → Atlas deployment → decay-alert notifications → institutional B2B2C tier → marketplace partnerships behind the Radar and Launchpad."),
    ])
    footer(s, ATTR)

    s = blank(prs, BLACK)
    kicker(s, "Evidence", dark=True)
    title(s, "Shipped, tested, verified", dark=True)
    bullets(s, [
        ("Complete MVP in the repo", "17-feature student experience + full admin console, all running end-to-end today."),
        ("113/113 automated tests · 53/53 live API QA checks", "RBAC matrix, plan gating, AI fallbacks, ownership, hardening."),
        ("Security posture", "Issuer-bound JWT, RBAC + plan gating, helmet CSP/HSTS, tiered rate limits, audit logging."),
        ("Ask", "Hackathon validation → seed round to ship Stripe billing, real deployment, and the emerging-market wedge."),
    ], dark=True)
    footer(s, ATTR, dark=True)

    prs.save("hackathon/07_Investor_Pitch_Deck.pptx")
    print("OK hackathon/07_Investor_Pitch_Deck.pptx (6 slides)")


# --- Hackathon deck: white/gray theme, richer animated primitives ----------
# This deck ships with real PowerPoint motion (python-pptx has no animation
# API, so it is injected as raw OOXML): a fade transition on every slide, and
# a fade build-on-click entrance on each slide's hero shapes — matching the
# technique already used for hackathon/17_Pro_Pitch_Deck.pptx. Every slide
# shares one white-and-gray theme with a blue accent (no more switching
# between black and white slides), and all copy is written in plain, simple
# English rather than product jargon.
SUP = "Supervisor: Mr. Asif Raza — Lecturer, University of Mianwali"
H_BG = RGBColor(0xFF, 0xFF, 0xFF)          # plain white background, every slide
H_PANEL = RGBColor(0xF4, 0xF5, 0xF7)       # light-gray card panel
H_PANEL_BORDER = RGBColor(0xDD, 0xE1, 0xE7)
H_ACCENT = RGBColor(0x25, 0x63, 0xEB)      # blue — strong contrast on white
H_ACCENT_LIGHT = RGBColor(0x3B, 0x82, 0xF6)
H_INK = RGBColor(0x11, 0x18, 0x27)         # near-black text, high readability
H_DIM = RGBColor(0x4B, 0x55, 0x63)         # medium gray for body text
H_DIM2 = RGBColor(0x8A, 0x93, 0xA3)        # light gray for footers/labels
H_GLOW = RGBColor(0xF1, 0xF5, 0xFB)        # barely-visible background tint
H_TOTAL = 16
P_NS = "http://schemas.openxmlformats.org/presentationml/2006/main"


def h_rect(slide, x, y, w, h, fill=H_PANEL, line_color=None, line_w=1.0):
    sh = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(h))
    if fill is None:
        sh.fill.background()
    else:
        sh.fill.solid()
        sh.fill.fore_color.rgb = fill
    if line_color is None:
        sh.line.fill.background()
    else:
        sh.line.color.rgb = line_color
        sh.line.width = Pt(line_w)
    sh.shadow.inherit = False
    return sh


def h_grad_bar(slide, x, y, w, h):
    """Blue-to-cyan gradient accent bar, used under every slide title."""
    sh = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(h))
    sh.line.fill.background()
    sh.shadow.inherit = False
    sh.fill.gradient()
    stops = sh.fill.gradient_stops
    stops[0].color.rgb = H_ACCENT
    stops[0].position = 0.0
    stops[1].color.rgb = H_ACCENT_LIGHT
    stops[1].position = 1.0
    sh.fill.gradient_angle = 0.0
    return sh


def h_glow(slide, cx, cy, d, color=H_GLOW):
    """Large, soft, mostly off-canvas circle for background depth."""
    sh = slide.shapes.add_shape(MSO_SHAPE.OVAL, Inches(cx), Inches(cy), Inches(d), Inches(d))
    sh.fill.solid()
    sh.fill.fore_color.rgb = color
    sh.line.fill.background()
    sh.shadow.inherit = False
    return sh


def h_textbox(slide, x, y, w, h, anchor=MSO_ANCHOR.TOP):
    sh = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = sh.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = anchor
    return sh


def h_para(tf_or_shape, text, size=14, color=H_INK, bold=False, italic=False,
           align=PP_ALIGN.LEFT, space_after=6, first=False, line_spacing=1.0):
    tf = tf_or_shape.text_frame if hasattr(tf_or_shape, "text_frame") else tf_or_shape
    p = tf.paragraphs[0] if first else tf.add_paragraph()
    p.alignment = align
    p.space_after = Pt(space_after)
    if line_spacing:
        p.line_spacing = line_spacing
    r = p.add_run()
    r.text = text
    r.font.size = Pt(size)
    r.font.bold = bold
    r.font.italic = italic
    r.font.color.rgb = color
    r.font.name = FONT
    return p


def h_card(slide, x, y, w, h, head, body, head_size=14, body_size=10.5, accent_head=False):
    sh = h_rect(slide, x, y, w, h, fill=H_PANEL, line_color=H_PANEL_BORDER, line_w=1.0)
    tf = sh.text_frame
    tf.word_wrap = True
    tf.margin_left = Inches(0.2)
    tf.margin_right = Inches(0.18)
    tf.margin_top = Inches(0.16)
    h_para(tf, head, size=head_size, color=(H_ACCENT if accent_head else H_INK), bold=True, first=True, space_after=4)
    if body:
        h_para(tf, body, size=body_size, color=H_DIM, space_after=0, line_spacing=1.08)
    return sh


def h_stat(slide, x, y, w, h, num, label, num_size=28):
    sh = h_rect(slide, x, y, w, h, fill=H_PANEL, line_color=H_PANEL_BORDER, line_w=1.0)
    tf = sh.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    h_para(tf, num, size=num_size, color=H_ACCENT, bold=True, align=PP_ALIGN.CENTER, first=True, space_after=2)
    h_para(tf, label, size=10, color=H_DIM, align=PP_ALIGN.CENTER, space_after=0)
    return sh


def h_footer(slide, n=None):
    f = h_textbox(slide, 0.7, 7.03, 9.5, 0.34)
    h_para(f, "Adaptive AI Learning Platform · University of Mianwali", size=9.5, color=H_DIM2, first=True, space_after=0)
    if n:
        g = h_textbox(slide, 11.0, 7.03, 1.63, 0.34)
        h_para(g, f"{n:02d} / {H_TOTAL}", size=9.5, color=H_DIM2, align=PP_ALIGN.RIGHT, first=True, space_after=0)


def h_header(slide, kick, title_text, n=None):
    k = h_textbox(slide, 0.7, 0.5, 11.93, 0.34)
    h_para(k, kick.upper(), size=12, color=H_ACCENT, bold=True, first=True, space_after=0)
    t = h_textbox(slide, 0.7, 0.85, 11.93, 0.92)
    h_para(t, title_text, size=27, color=H_INK, bold=True, first=True, space_after=0)
    h_grad_bar(slide, 0.72, 1.68, 0.95, 0.045)
    h_footer(slide, n=n)
    return [k, t]


def h_bullets(slide, items, x=0.7, y=2.0, w=11.93, h=4.6, size=14.5, gap=11):
    tb = h_textbox(slide, x, y, w, h)
    tf = tb.text_frame
    for i, it in enumerate(items):
        if isinstance(it, tuple):
            head, body = it
            h_para(tf, head, size=size, color=H_ACCENT, bold=True, first=(i == 0), space_after=3)
            h_para(tf, body, size=size - 2.5, color=H_DIM, space_after=gap, line_spacing=1.08)
        else:
            h_para(tf, "•   " + it, size=size, color=H_INK, first=(i == 0), space_after=gap)
    return tb


def h_col_header(slide, x, y, w, text):
    tb = h_textbox(slide, x, y, w, 0.3)
    h_para(tb, text.upper(), size=11.5, color=H_ACCENT, bold=True, first=True, space_after=0)
    h_rect(slide, x + 0.01, y + 0.32, w - 0.02, 0.016, fill=H_PANEL_BORDER)
    return tb


def h_arrow(slide, x, y):
    tb = h_textbox(slide, x, y, 0.4, 0.5, anchor=MSO_ANCHOR.MIDDLE)
    h_para(tb, "→", size=20, color=H_ACCENT, bold=True, align=PP_ALIGN.CENTER, first=True, space_after=0)
    return tb


def h_blank(prs):
    """Every slide in this deck shares the same deep-navy background."""
    s = prs.slides.add_slide(prs.slide_layouts[6])
    fill = s.background.fill
    fill.solid()
    fill.fore_color.rgb = H_BG
    return s


def h_set_transition(slide):
    xml = f'<p:transition xmlns:p="{P_NS}" spd="med" advClick="1"><p:fade/></p:transition>'
    slide._element.append(etree.fromstring(xml))


def h_set_entrance(slide, shapes, effect_dur=450):
    """Fade-in entrance (build on click) for each shape, in order."""
    ids = [str(sh.shape_id) for sh in shapes]
    if not ids:
        return
    cid = [2]

    def nid():
        cid[0] += 1
        return cid[0]

    inner = []
    for spid in ids:
        o, m, e, s1, s2 = nid(), nid(), nid(), nid(), nid()
        inner.append(
            f'<p:par><p:cTn id="{o}" fill="hold"><p:stCondLst><p:cond delay="indefinite"/></p:stCondLst>'
            f'<p:childTnLst><p:par><p:cTn id="{m}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst>'
            f'<p:childTnLst><p:par><p:cTn id="{e}" presetID="10" presetClass="entr" presetSubtype="0" '
            f'fill="hold" grpId="0" nodeType="clickEffect"><p:stCondLst><p:cond delay="0"/></p:stCondLst>'
            f'<p:childTnLst><p:set><p:cBhvr><p:cTn id="{s1}" dur="1" fill="hold">'
            f'<p:stCondLst><p:cond delay="0"/></p:stCondLst></p:cTn><p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl>'
            f'<p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr>'
            f'<p:to><p:strVal val="visible"/></p:to></p:set><p:animEffect transition="in" filter="fade">'
            f'<p:cBhvr><p:cTn id="{s2}" dur="{effect_dur}"/><p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl></p:cBhvr>'
            f'</p:animEffect></p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par>'
        )
    xml = (
        f'<p:timing xmlns:p="{P_NS}"><p:tnLst><p:par>'
        f'<p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst>'
        f'<p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq">'
        f'<p:childTnLst>{"".join(inner)}</p:childTnLst></p:cTn>'
        f'<p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst>'
        f'<p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst>'
        f'</p:seq></p:childTnLst></p:cTn></p:par></p:tnLst></p:timing>'
    )
    slide._element.append(etree.fromstring(xml))


def h_finish(slide, targets):
    h_set_transition(slide)
    h_set_entrance(slide, targets)


def build_hackathon():
    prs = new_deck()

    # 1 — Title ---------------------------------------------------------
    s = h_blank(prs)
    h_glow(s, 9.5, -2.5, 7.0)
    h_glow(s, -3.0, 4.5, 6.0)
    tg = []
    k = h_textbox(s, 0.9, 1.1, 11.5, 0.4)
    h_para(k, "HACKATHON PRESENTATION", size=13, color=H_ACCENT, bold=True, first=True)
    tg.append(k)
    t = h_textbox(s, 0.9, 1.65, 11.5, 2.3)
    h_para(t, "The AI tutor that never forgets you", size=38, color=H_INK, bold=True, first=True, space_after=12)
    h_para(t, "It learns how you learn, warns you before you forget a skill, and turns what "
              "you know into scholarships, jobs, and your first paying client.", size=16, color=H_DIM)
    tg.append(t)
    h_grad_bar(s, 0.95, 4.35, 1.2, 0.05)
    cr = h_textbox(s, 0.9, 4.6, 11.5, 0.9)
    h_para(cr, ATTR, size=12, color=H_DIM, bold=True, first=True, space_after=4)
    h_para(cr, SUP, size=12, color=H_DIM)
    tg.append(cr)
    for i, (num, lab) in enumerate([("17+", "things students can do"), ("113/113", "tests all passing"),
                                     ("53/53", "live checks all passing")]):
        tg.append(h_stat(s, 0.9 + i * 3.95, 5.75, 3.7, 1.0, num, lab, num_size=26))
    h_finish(s, tg)

    # 2 — Agenda ----------------------------------------------------------
    s = h_blank(prs)
    tg = h_header(s, "Agenda", "What we will cover", n=2)
    rows = [
        ("01", "The Problem", "Why most online coding courses fail the people who need them most"),
        ("02", "Who We Built This For", "Self-taught coders, university students, and career switchers"),
        ("03", "The Solution", "One simple loop: learn, remember, practice, and get hired"),
        ("04", "Everything It Can Do", "Every big feature, shown on one easy-to-read slide"),
        ("05", "Live Demo", "Five minutes, the parts that make people say ‘wow’"),
        ("06", "Getting You Hired", "Our newest feature: from job ad to job offer, step by step"),
        ("07", "How It's Built", "The technology underneath, explained simply"),
        ("08", "What's Next", "Proof it works today, and where we take it next"),
    ]
    y = 1.95
    for num, head, sub in rows:
        nb = h_textbox(s, 0.7, y, 0.9, 0.56)
        h_para(nb, num, size=18, color=H_ACCENT, bold=True, first=True, space_after=0)
        tb = h_textbox(s, 1.65, y, 10.9, 0.62)
        h_para(tb, head, size=14.5, color=H_INK, bold=True, first=True, space_after=1)
        h_para(tb, sub, size=10.5, color=H_DIM, space_after=0)
        h_rect(s, 0.7, y + 0.62, 11.93, 0.012, fill=H_PANEL_BORDER)
        tg += [nb, tb]
        y += 0.66
    h_finish(s, tg)

    # 3 — Divider: The Problem -----------------------------------------
    s = h_blank(prs)
    h_glow(s, 8.5, -3.0, 7.5)
    tg = []
    wm = h_textbox(s, 0.75, 0.9, 6.0, 3.0)
    h_para(wm, "01", size=140, color=H_PANEL, bold=True, first=True, space_after=0)
    tg.append(wm)
    tt = h_textbox(s, 0.95, 3.85, 11.0, 1.6)
    h_grad_bar(s, 0.98, 3.7, 1.25, 0.05)
    h_para(tt, "The Problem", size=38, color=H_INK, bold=True, first=True, space_after=8)
    h_para(tt, "Most online courses teach everyone the same way. That does not work.", size=16, color=H_DIM)
    tg.append(tt)
    h_footer(s, n=3)
    h_finish(s, tg)

    # 4 — Problem detail ---------------------------------------------------
    s = h_blank(prs)
    tg = h_header(s, "01 · The Problem", "Three things wrong with how coding is taught online", n=4)
    cw = 3.83
    xs = [0.7, 0.7 + cw + 0.22, 0.7 + 2 * (cw + 0.22)]
    data = [
        ("Same lessons for everyone", "Every student sees the same content, no matter what they already know. Most people get bored or lost, and quit."),
        ("Nobody tracks forgetting", "Courses show what you finished, not what you still remember. Skills quietly fade and no one warns you."),
        ("Learning does not lead anywhere", "Finishing a course does not get you a job, a scholarship, or your first client. There is no next step."),
    ]
    for x, (h, b) in zip(xs, data):
        tg.append(h_card(s, x, 2.0, cw, 2.3, h, b, body_size=11))
    band = [
        ("9 in 10", "online students never finish their course"),
        ("1 path", "the same lessons for every single learner"),
        ("1 billion", "new learners coming from poorer countries"),
    ]
    for i, (num, lab) in enumerate(band):
        tg.append(h_stat(s, xs[i], 4.55, cw, 1.5, num, lab, num_size=26))
    h_finish(s, tg)

    # 5 — Who it's for ------------------------------------------------------
    s = h_blank(prs)
    tg = h_header(s, "02 · Who We Built This For", "Four kinds of learners, one platform", n=5)
    cw5, ch5 = 2.87, 3.1
    xs5 = [0.7 + i * (cw5 + 0.15) for i in range(4)]
    data5 = [
        ("Self-taught coders", "No teacher, no feedback, no proof of skill. They need a clear path and someone to check their work."),
        ("University students", "Lots of theory, little practice for real interviews. They need hands-on skill and proof employers trust."),
        ("Career switchers", "Coming from a different job. They need a fast, honest way to see what to learn first."),
        ("Students in poorer countries", "Priced out by Western courses, and taught only in English. They need fair prices and their own language."),
    ]
    for x, (h, b) in zip(xs5, data5):
        tg.append(h_card(s, x, 2.0, cw5, ch5, h, b, head_size=13.5, body_size=10.5))
    bl5 = h_textbox(s, 0.7, 5.45, 11.93, 0.9)
    h_para(bl5, "Main audience: students in Pakistan, India, and the Middle East. "
                "Second audience: universities and coding bootcamps.", size=12.5, color=H_DIM, bold=True, first=True, line_spacing=1.1)
    tg.append(bl5)
    h_finish(s, tg)

    # 6 — Divider: The Solution ------------------------------------------
    s = h_blank(prs)
    h_glow(s, -2.5, -2.5, 6.5)
    tg = []
    wm = h_textbox(s, 0.75, 0.9, 6.0, 3.0)
    h_para(wm, "03", size=140, color=H_PANEL, bold=True, first=True, space_after=0)
    tg.append(wm)
    tt = h_textbox(s, 0.95, 3.85, 11.0, 1.6)
    h_grad_bar(s, 0.98, 3.7, 1.25, 0.05)
    h_para(tt, "The Solution", size=38, color=H_INK, bold=True, first=True, space_after=8)
    h_para(tt, "One AI tutor that teaches you, remembers for you, and gets you hired.", size=16, color=H_DIM)
    tg.append(tt)
    h_footer(s, n=6)
    h_finish(s, tg)

    # 7 — Solution loop -----------------------------------------------------
    s = h_blank(prs)
    tg = h_header(s, "03 · The Solution", "One simple loop, from your first answer to your first job", n=7)
    steps = [
        ("1 · Test you", "A smart quiz checks what you know. It gets harder or easier based on your answers."),
        ("2 · Teach you", "Lessons change to fit you — simple examples for beginners, deep detail for experts."),
        ("3 · Coach you", "Your code gets real feedback: does it work, is it clean, is it fast, does it handle edge cases."),
        ("4 · Remember for you", "We warn you before you forget a skill, then a 2-minute review brings it right back."),
        ("5 · Pay off for you", "Your skills turn into a certificate, a scholarship, a freelance profile, or a 90-day job plan."),
    ]
    cw2, gap2, x = 2.28, 0.135, 0.7
    for i, (h, b) in enumerate(steps):
        tg.append(h_card(s, x, 2.15, cw2, 2.5, h, b, head_size=13, body_size=10, accent_head=True))
        if i < 4:
            tg.append(h_arrow(s, x + cw2 - 0.02, 3.1))
        x += cw2 + gap2
    bl = h_textbox(s, 0.7, 5.05, 11.93, 1.0)
    h_para(bl, "Every step teaches the AI more about you — so the longer you use it, the smarter and "
               "more personal it gets.", size=13, color=H_DIM, bold=True, first=True, space_after=0)
    tg.append(bl)
    h_finish(s, tg)

    # 8 — EVERYTHING on one slide ----------------------------------------
    s = h_blank(prs)
    tg = h_header(s, "04 · Everything It Can Do", "Every big feature, on one slide", n=8)
    h_col_header(s, 0.7, 1.95, 5.9, "Learn it, remember it, plan it")
    tg.append(h_bullets(s, [
        ("Smart Quizzes", "AI-made questions that get harder or easier as you answer."),
        ("Lessons That Rewrite Themselves", "Same topic, explained the way that works for you."),
        ("Real Code Feedback", "Checks if your code works, is clean, is fast, handles edge cases."),
        ("Ask-Anything AI Tutor", "A chat tutor you can ask about any topic, any time."),
        ("Memory Twin", "Shows you what you're about to forget, before you forget it."),
        ("Struggle DNA", "Figures out why you keep getting stuck, and how to fix it."),
        ("Career Map + 7-Day Planner", "64 tech careers to explore, plus a study plan made just for you."),
    ], x=0.7, y=2.3, w=5.9, h=4.3, size=11.5, gap=6))
    h_col_header(s, 6.75, 1.95, 5.9, "Prove it, get rewarded for it")
    tg.append(h_bullets(s, [
        ("Job Match Score", "Paste any job ad. See your match score and your real skill gaps."),
        ("Practice Tests Made For You", "Short quizzes and coding tasks built around your exact gaps."),
        ("Interview Practice — free", "Practice real interview questions, time yourself, grade yourself."),
        ("Job Application Tracker — free", "Track every job you apply to and see your real success rate."),
        ("System Design Practice", "Practice system-design interview questions with AI feedback."),
        ("Skill Passport", "A shareable, verified proof of your real skills."),
        ("Scholarships + Freelance Help", "15 funded scholarships, plus a ready-made freelance profile."),
        ("Fair Pricing + Urdu Support", "Lower prices for poorer countries, and lessons in Urdu too."),
    ], x=6.75, y=2.3, w=5.9, h=4.3, size=11.5, gap=5))
    h_finish(s, tg)

    # 9 — Divider: Live Demo -------------------------------------------------
    s = h_blank(prs)
    h_glow(s, 9.0, 4.5, 6.5)
    tg = []
    wm = h_textbox(s, 0.75, 0.9, 6.0, 3.0)
    h_para(wm, "05", size=140, color=H_PANEL, bold=True, first=True, space_after=0)
    tg.append(wm)
    tt = h_textbox(s, 0.95, 3.85, 11.0, 1.6)
    h_grad_bar(s, 0.98, 3.7, 1.25, 0.05)
    h_para(tt, "Live Demo", size=38, color=H_INK, bold=True, first=True, space_after=8)
    h_para(tt, "Five minutes. The six moments that make people lean forward.", size=16, color=H_DIM)
    tg.append(tt)
    h_footer(s, n=9)
    h_finish(s, tg)

    # 10 — Demo flow -----------------------------------------------------
    s = h_blank(prs)
    tg = h_header(s, "05 · Live Demo", "Six moments, in order", n=10)
    tg.append(h_bullets(s, [
        ("1 · Sign up, take the quiz", "Watch the questions change live as you answer, and see your skill map build itself."),
        ("2 · Watch a lesson rewrite itself", "Drop your score in a topic, and the lesson changes to fit you better."),
        ("3 · See your memory forecast", "We show what you're about to forget, run a 2-minute review, and reveal why you keep getting stuck."),
        ("4 · Paste a real job ad", "Get your match score in seconds, plus the one skill most likely to cost you the interview."),
        ("5 · Practice and track", "Build an interview script from your own gaps, grade yourself, then log the job in your tracker."),
        ("6 · See the extra rewards", "Download your Skill Passport, check live scholarship deadlines, get a freelance profile in one click."),
    ], y=1.95, size=13.5, gap=9))
    h_finish(s, tg)

    # 11 — Getting You Hired spotlight -------------------------------
    s = h_blank(prs)
    tg = h_header(s, "06 · Getting You Hired", "From ‘what job ad?’ to ‘I got the offer’", n=11)
    cw3, ch3 = 5.9, 2.2
    positions = [(0.7, 2.0), (6.73, 2.0), (0.7, 4.35), (6.73, 4.35)]
    data = [
        ("Your Match Score", "Paste any job ad. We score how well you match it — overall, and broken down by must-have and nice-to-have skills."),
        ("Practice Tests Made For You", "We turn your biggest skill gaps into a short quiz, a coding task, or a mock interview question."),
        ("Interview Practice — free", "Practice real interview questions out loud, time yourself, and grade your own answers. No charge, ever."),
        ("Job Tracker — free", "Track every job you apply to, and see your real reply rate — not a guess, an honest number. No charge, ever."),
    ]
    for (x, y), (h, b) in zip(positions, data):
        tg.append(h_card(s, x, y, cw3, ch3, h, b, body_size=11))
    h_finish(s, tg)

    # 12 — Divider: How It's Built ------------------------------------------
    s = h_blank(prs)
    h_glow(s, -3.0, 5.0, 6.0)
    tg = []
    wm = h_textbox(s, 0.75, 0.9, 6.0, 3.0)
    h_para(wm, "06", size=140, color=H_PANEL, bold=True, first=True, space_after=0)
    tg.append(wm)
    tt = h_textbox(s, 0.95, 3.85, 11.0, 1.6)
    h_grad_bar(s, 0.98, 3.7, 1.25, 0.05)
    h_para(tt, "How It's Built", size=38, color=H_INK, bold=True, first=True, space_after=8)
    h_para(tt, "Built the right way, and tested until it broke — then fixed.", size=16, color=H_DIM)
    tg.append(tt)
    h_footer(s, n=12)
    h_finish(s, tg)

    # 13 — Technical rigor, in plain English --------------------------------
    s = h_blank(prs)
    tg = h_header(s, "06 · How It's Built", "The technology, explained without the jargon", n=13)
    tg.append(h_bullets(s, [
        ("A modern, clean codebase", "Built with React, Node.js, and MongoDB — all in one well-organized project."),
        ("AI that never breaks", "If the AI fails or is slow, a backup system takes over right away. The app never crashes."),
        ("Safe by design", "Secure logins, strict permissions, and protection against common hacking tricks."),
        ("Tested, not just hoped", "113 out of 113 automated tests pass. 53 out of 53 real-world checks pass too."),
    ], y=1.95, size=14.5, gap=11))
    h_finish(s, tg)

    # 14 — Traction ----------------------------------------------------
    s = h_blank(prs)
    tg = h_header(s, "07 · What's Working Today", "Already built, already running", n=14)
    tiles = [("17+", "features for students"), ("113/113", "tests passing"), ("5", "skill areas tracked"),
             ("64", "tech careers mapped"), ("15", "funded scholarships"), ("2 × 3", "AI backup system")]
    tw3 = 1.87
    for i, (num, lab) in enumerate(tiles):
        tg.append(h_stat(s, 0.7 + i * (tw3 + 0.14), 2.1, tw3, 1.4, num, lab, num_size=22))
    h_col_header(s, 0.7, 3.9, 11.93, "What's actually running, right now")
    tg.append(h_bullets(s, [
        "Sign-up, logins, and a full admin dashboard with an activity log",
        "The whole 'Getting You Hired' toolkit, plus free interview practice and a free job tracker",
        "Ready to go live — the hosting setup is already built and waiting to be switched on",
    ], x=0.7, y=4.4, w=11.93, h=2.2, size=13.5, gap=8))
    h_finish(s, tg)

    # 15 — What's next & the ask ------------------------------------------
    s = h_blank(prs)
    tg = h_header(s, "08 · What's Next", "A clear, honest plan from here", n=15)
    phases = [
        ("Right now", "A complete product, already running, with 113 passing tests."),
        ("Next", "Go live for real users, and turn on paid plans."),
        ("Then", "Add reminders so students never forget to come back."),
        ("Later", "Partner with universities and bootcamps."),
    ]
    cw15 = 2.87
    xs15 = [0.7 + i * (cw15 + 0.15) for i in range(4)]
    for x, (h, b) in zip(xs15, phases):
        tg.append(h_card(s, x, 2.0, cw15, 2.6, h, b, head_size=14, body_size=11, accent_head=True))
    band = h_rect(s, 0.7, 4.95, 11.93, 1.1, fill=H_PANEL, line_color=H_PANEL_BORDER, line_w=1.0)
    tf = band.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    tf.margin_left = Inches(0.24)
    tf.margin_right = Inches(0.22)
    h_para(tf, "What we're asking for", size=13, color=H_ACCENT, bold=True, first=True, space_after=3)
    h_para(tf, "Your support to take this from a hackathon project to something real students "
               "use every day.", size=13.5, color=H_INK, space_after=0, line_spacing=1.05)
    tg.append(band)
    h_finish(s, tg)

    # 16 — Closing ----------------------------------------------------------
    s = h_blank(prs)
    h_glow(s, 9.5, -2.0, 7.0)
    h_glow(s, -3.0, 5.0, 6.0)
    tg = []
    t = h_textbox(s, 0.9, 2.1, 11.5, 2.2)
    h_para(t, "Thank you", size=48, color=H_INK, bold=True, first=True, space_after=12)
    h_para(t, "Adaptive AI Learning Platform — the tutor that never forgets you.", size=17, color=H_DIM, line_spacing=1.1)
    tg.append(t)
    h_grad_bar(s, 0.95, 4.35, 1.25, 0.05)
    cr2 = h_textbox(s, 0.9, 4.6, 11.5, 1.4)
    h_para(cr2, ATTR, size=13, color=H_DIM, bold=True, first=True, space_after=4)
    h_para(cr2, SUP, size=13, color=H_DIM, space_after=10)
    h_para(cr2, "Live demo and questions welcome.", size=12.5, color=H_ACCENT, italic=True, space_after=0)
    tg.append(cr2)
    h_footer(s, n=16)
    h_finish(s, tg)

    prs.save("hackathon/09_Hackathon_Pitch.pptx")
    print(f"OK hackathon/09_Hackathon_Pitch.pptx ({len(prs.slides._sldIdLst)} slides, animated, white/gray theme)")


PITCH_SUB = ("A live AI tutor for computer science that diagnoses each learner, rewrites lessons "
             "to their level, predicts what they will forget, and turns skill into scholarships, "
             "jobs, and first clients.")


def _pitch_section_slides(prs, foot):
    """The five pitch sections: problem, solution, need/impact, innovation/tech, feasibility."""
    # 01 — The problem you are solving, and who it affects
    s = blank(prs)
    kicker(s, "01 · The Problem")
    title(s, "Static courses fail the people who need them most")
    bullets(s, [
        ("One-size-fits-all content", "Every learner sees the same lessons regardless of strength, weakness, or style — so most disengage. Over 90% of students drop out of static online CS courses."),
        ("No memory of forgetting", "Platforms record what you completed, not what you retained. Skills silently decay after the assessment, and nobody warns the learner in time."),
        ("Learning stops at 'course finished'", "Students still cannot pass interviews, prove skills for study abroad, or land a first client. There is no bridge from learning to real outcomes."),
        ("Who it affects", "Self-taught and university CS learners in price-sensitive, underserved markets — Pakistan, India, MENA, Southeast Asia — where US-priced, English-only products leave the next billion learners behind."),
    ])
    footer(s, foot)

    # 02 — Your solution, and the audience it serves
    s = blank(prs)
    kicker(s, "02 · The Solution")
    title(s, "A live AI tutor that adapts, remembers, and opens doors")
    card(s, 0.7, 2.0, 5.9, 2.15, "Diagnose → adapt → mentor",
         "Gemini-generated adaptive diagnostics build a 5-domain Capability Matrix; lessons rewrite themselves to each learner's level and style; code gets 4-axis tiered mentorship.")
    card(s, 6.75, 2.0, 5.9, 2.15, "It remembers you",
         "Memory Twin™ fits forgetting curves to real practice and forecasts 14-day retention; Struggle DNA™ profiles how a learner fails, not just what they missed.")
    card(s, 0.7, 4.3, 5.9, 2.15, "It plans the path",
         "Domain Compass™ maps 64 computing domains with 10-year demand trends; PathFinder™ turns the live matrix into an adaptive 7-day study plan.")
    card(s, 6.75, 4.3, 5.9, 2.15, "It converts skill into opportunity",
         "Skill Passport™, Scholarship Radar™, Freelance Launchpad™, and the Career Readiness Stack™ — Autopilot's fit %, a gap-targeted assessment, a scored interview rehearsal, and a tracked application pipeline.")
    tf = box(s, 0.7, 6.6, 12, 0.4)
    line(tf, "Audience: CS students and self-taught developers in emerging markets first; universities and bootcamps (B2B2C) second. The opportunity layer is free by design; the retention engine is the premium tier.",
         size=11.5, color=GRAY_DARK, bold=True, first=True)
    footer(s, foot)

    # 03 — The need it addresses and the impact it makes
    s = blank(prs)
    kicker(s, "03 · Need & Impact")
    title(s, "From completion to consequence")
    bullets(s, [
        ("The need", "Learners do not need more content — they need to know what to learn next, remember it, and prove it. Incumbents optimize watch-time; nobody owns retention or outcomes."),
        ("Impact on the learner", "A personalized path, an early warning before a skill fades, and portable evidence — turning months of scattered effort into interviews passed, scholarships won, and first income earned."),
        ("Impact on the market", "PPP regional pricing (Pakistan ₨999 default, 8 markets) and an Urdu dual-language glossary make quality CS education reachable where US-priced, English-only products never land."),
        ("Why it compounds", "Every answer feeds the Capability Matrix, Struggle DNA, and Memory Twin — the model of each learner sharpens with use, so retention and outcomes improve the longer they stay."),
    ])
    footer(s, foot)

    # 04 — The innovation and the technology behind it (two columns)
    s = blank(prs)
    kicker(s, "04 · Innovation & Technology")
    title(s, "Novel capabilities on a demo-proof stack")
    tf = box(s, 0.7, 1.95, 5.9, 0.35)
    line(tf, "THE INNOVATION", size=12, color=GRAY_MID, bold=True, first=True)
    bullets(s, [
        ("Memory Twin™", "Skill-decay prediction from forgetting curves + 2-minute Rescue Reviews before a skill fades."),
        ("Struggle DNA™", "Cognitive phenotyping — a struggle archetype with targeted countermeasures."),
        ("Career Readiness Stack™", "JD → weighted fit % → gap-targeted assessment → scored interview rehearsal → tracked response rate, one closed loop."),
        ("Global Access Doctrine™", "PPP pricing and an Urdu glossary — access, not just content."),
    ], x=0.7, y=2.35, w=5.9, h=4.4, size=13, gap=8)
    tf = box(s, 6.75, 1.95, 5.9, 0.35)
    line(tf, "THE TECHNOLOGY", size=12, color=GRAY_MID, bold=True, first=True)
    bullets(s, [
        ("MERN + TypeScript monorepo", "React 19 + Vite, Express 5 strict MVC, Mongoose, shared Zod schemas."),
        ("AI isolated + structured", "All Gemini calls live in a services layer, declare a response schema, validate before persisting."),
        ("Never fails live", "Dual-key/model cascade with quota + overload rollover and a deterministic mock fallback."),
        ("Secure by design", "Issuer-bound JWT, RBAC + plan gating, helmet CSP/HSTS, tiered rate limits, audit logging."),
    ], x=6.75, y=2.35, w=5.9, h=4.4, size=13, gap=8)
    footer(s, foot)

    # 05 — Feasibility, and what you have actually built
    s = blank(prs, BLACK)
    kicker(s, "05 · Feasibility & Traction", dark=True)
    title(s, "Not a slide — a shipped, running product", dark=True)
    bullets(s, [
        ("Built and running today", "A 17-feature student experience plus a full admin console run end-to-end locally on the monorepo above."),
        ("Verified quality", "113/113 automated tests (RBAC matrix, plan gating, AI fallbacks, ownership, hardening, career stack) and a WCAG-AA contrast audit on every route in dark + light."),
        ("Feasible to run and scale", "Free-tier infrastructure — MongoDB Atlas M0, Vercel serverless, Gemini free tier — with fallbacks that remove any single-API dependency; one maintainer can operate it."),
        ("Deployment-ready", "The Vercel single-project serverless adapter and config are complete (same-origin, no CORS); it goes live the moment Atlas and the deploy token are wired."),
        ("The ask", "Hackathon validation, then a seed round to ship Stripe billing, the live production deploy, and the emerging-market wedge."),
    ], dark=True)
    footer(s, foot, dark=True)


def build_pitch_deck():
    """Competition pitch: problem, solution, need/impact, innovation/tech, feasibility."""
    prs = new_deck()
    title_slide(prs, "Competition Pitch", "Adaptive AI Learning Platform", PITCH_SUB, ATTR)
    _pitch_section_slides(prs, ATTR)
    prs.save("docs/15_Pitch_Deck.pptx")
    print("OK docs/15_Pitch_Deck.pptx (6 slides)")


def build_university_deck():
    """University submission pitch — same five sections, credited with the supervisor."""
    supervisor = "Supervisor: Mr. Asif Raza — Lecturer, University of Mianwali"
    foot = "Syed Azan Mehdi Shah · Supervisor: Mr. Asif Raza, Lecturer — University of Mianwali"
    prs = new_deck()
    title_slide(
        prs,
        "University of Mianwali · Project Pitch",
        "Adaptive AI Learning Platform",
        PITCH_SUB,
        ATTR,
        supervisor,
    )
    _pitch_section_slides(prs, foot)
    prs.save("docs/16_University_Pitch_Deck.pptx")
    print("OK docs/16_University_Pitch_Deck.pptx (6 slides)")


if __name__ == "__main__":
    import sys

    builders = {
        "overview": build_overview,
        "investor": build_investor,
        "hackathon": build_hackathon,
        "pitch": build_pitch_deck,
        "university": build_university_deck,
    }
    which = sys.argv[1].lower() if len(sys.argv) > 1 else "all"
    if which == "all":
        for fn in builders.values():
            fn()
    elif which in builders:
        builders[which]()
    else:
        print(f"Unknown deck '{which}'. Choose from: {', '.join(builders)} (or 'all').")
        sys.exit(1)
