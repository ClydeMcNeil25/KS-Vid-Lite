import { validateDuration } from "../duration/validateDuration";

const mockMedia = [
  { id: "1", path: "a.mp4", duration: 20, width: 1920, height: 1080 },
  { id: "2", path: "b.mp4", duration: 25, width: 1920, height: 1080 }
];

const result = validateDuration(mockMedia, 60, "strict");

console.log(result);