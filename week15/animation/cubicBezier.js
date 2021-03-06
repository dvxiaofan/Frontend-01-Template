1;
2;
3;
4;
5;
6;
7;
8;
9;
10;
11;
12;
13;
14;
15;
16;
17;
18;
19;
20;
21;
22;
23;
24;
25;
26;
27;
28;
29;
30;
31;
32;
33;
34;
35;
36;
37;
38;
39;
40;
41;
42;
43;
44;
45;
46;
47;
48;
49;
50;
51;
52;
53;
54;
55;
56;
57;
58;
59;
60;
61;
62;
63;
64;
65;
66;
67;
68;
69;
70;
71;
72;
73;
74;
75;
76;
77;
78;
79;
80;
81;
82;
export function cubicBezier(p1x, p1y, p2x, p2y) {
	const ZERO_LIMIT = 1e-6;
	// Calculate the polynomial coefficients,
	// implicit first and last control points are (0,0) and (1,1).
	const ax = 3 * p1x - 3 * p2x + 1;
	const bx = 3 * p2x - 6 * p1x;
	const cx = 3 * p1x;

	const ay = 3 * p1y - 3 * p2y + 1;
	const by = 3 * p2y - 6 * p1y;
	const cy = 3 * p1y;

	function sampleCurveDerivativeX(t) {
		// `ax t^3 + bx t^2 + cx t' expanded using Horner 's rule.
		return (3 * ax * t + 2 * bx) * t + cx;
	}

	function sampleCurveX(t) {
		return ((ax * t + bx) * t + cx) * t;
	}

	function sampleCurveY(t) {
		return ((ay * t + by) * t + cy) * t;
	}

	// Given an x value, find a parametric value it came from.
	function solveCurveX(x) {
		var t2 = x;
		var derivative;
		var x2;

		for (let i = 0; i < 8; i++) {
			// f(t)-x=0
			x2 = sampleCurveX(t2) - x;
			if (Math.abs(x2) < ZERO_LIMIT) {
				return t2;
			}
			derivative = sampleCurveDerivativeX(t2);
			// == 0, failure
			/* istanbul ignore if */
			if (Math.abs(derivative) < ZERO_LIMIT) {
				break;
			}
			t2 -= x2 / derivative;
		}

		// Fall back to the bisection method for reliability.
		// bisection
		// http://en.wikipedia.org/wiki/Bisection_method
		var t1 = 1;
		/* istanbul ignore next */
		var t0 = 0;

		/* istanbul ignore next */
		t2 = x;
		/* istanbul ignore next */
		while (t1 > t0) {
			x2 = sampleCurveX(t2) - x;
			if (Math.abs(x2) < ZERO_LIMIT) {
				return t2;
			}
			if (x2 > 0) {
				t1 = t2;
			} else {
				t0 = t2;
			}
			t2 = (t1 + t0) / 2;
		}

		// Failure
		return t2;
	}

	function solve(x) {
		return sampleCurveY(solveCurveX(x));
	}

	return solve;
}
