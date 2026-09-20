import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import type { FC, PropsWithChildren } from "react";
import { describe, expect, it, vi } from "vitest";
import LoginPage from "@/app/auth/login/page";
import useAuthSessionStore from "@/stores/auth-session";

const mutate = vi.fn();

vi.mock("@/hooks/useAuth", () => ({
  useLogin: vi.fn(() => ({ mutate, isPending: false })),
  useMe: vi.fn(() => ({ data: undefined, isLoading: false })),
  useProviders: vi.fn(() => ({ data: undefined, isLoading: false })),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => ({ get: () => null }),
}));

const TestProviders: FC<PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    {children}
  </QueryClientProvider>
);

describe("login demo account", () => {
  it("fills the exact reviewer credentials without submitting", () => {
    useAuthSessionStore.getState().resetForTests();
    useAuthSessionStore.getState().markAnonymous();

    render(
      <TestProviders>
        <LoginPage />
      </TestProviders>,
    );

    const email = screen.getByPlaceholderText("you@company.com") as HTMLInputElement;
    const password = screen.getByPlaceholderText("Password") as HTMLInputElement;

    expect(email.value).toBe("");

    fireEvent.click(screen.getByRole("button", { name: "Use Demo Account" }));

    expect(email.value).toBe("demo.user@demo.company.com");
    expect(password.value).toBe("ThereWeGoAgain@123");
    expect(mutate).not.toHaveBeenCalled();
  });

  it("renders the demo button as a non-submit control with helper copy", () => {
    useAuthSessionStore.getState().resetForTests();
    useAuthSessionStore.getState().markAnonymous();

    render(
      <TestProviders>
        <LoginPage />
      </TestProviders>,
    );

    const button = screen.getByRole("button", { name: "Use Demo Account" });

    expect(button.getAttribute("type")).toBe("button");
    expect(screen.getByText("Populate the public reviewer demo credentials.")).toBeDefined();
  });
});
