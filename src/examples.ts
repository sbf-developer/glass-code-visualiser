import type { Example } from "./types";

export const EXAMPLES: Example[] = [
  {
    id: "bubble-sort",
    title: "Bubble Sort",
    description: "Watch values swap as the algorithm bubbles the largest element to the end.",
    code: `# Bubble sort — watch elements swap
arr = [64, 34, 25, 12, 22, 11, 90]

for i in range(len(arr)):
    for j in range(len(arr) - i - 1):
        if arr[j] > arr[j + 1]:
            arr[j], arr[j + 1] = arr[j + 1], arr[j]

print("Sorted:", arr)
`,
  },
  {
    id: "binary-search",
    title: "Binary Search",
    description: "See the search window shrink with each comparison.",
    code: `# Binary search on a sorted list
nums = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
target = 23

left = 0
right = len(nums) - 1

while left <= right:
    mid = (left + right) // 2
    if nums[mid] == target:
        result = mid
        break
    elif nums[mid] < target:
        left = mid + 1
    else:
        right = mid - 1
else:
    result = -1

print("Found at index:", result)
`,
  },
  {
    id: "linked-list",
    title: "Build a List",
    description: "Simple list operations — append, pop, and iterate.",
    code: `# List as a dynamic array
items = []
items.append("apple")
items.append("banana")
items.append("cherry")

first = items[0]
last = items.pop()

print("First:", first)
print("Remaining:", items)
`,
  },
  {
    id: "recursion",
    title: "Factorial",
    description: "Step into recursive calls and watch the call stack grow.",
    code: `# Recursive factorial
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

result = factorial(5)
print("5! =", result)
`,
  },
  {
    id: "dict-ops",
    title: "Dictionary",
    description: "Track key-value pairs as you build a frequency map.",
    code: `# Count character frequencies
text = "hello"
freq = {}

for ch in text:
    if ch in freq:
        freq[ch] = freq[ch] + 1
    else:
        freq[ch] = 1

print(freq)
`,
  },
];
