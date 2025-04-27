import { render, screen } from "@testing-library/react";
import HelloWorld from "../src/components/HelloWorld";


test("renders Hello World text", () => {
  render(<HelloWorld />);
  expect(screen.getByText("Hello World!")).toBeInTheDocument();
});
