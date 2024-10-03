import { ReactNode, ReactElement, act } from "react";
import { useDialog } from "@/components/Dialog/useDialog";
import { DialogProvider } from "@/components/Dialog/DialogProvider";
import { renderHook } from "@testing-library/react";

describe('useDialog', () => {

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Define the wrapper to provide Dialog context
  const wrapper = ({ children }: { children?: ReactNode }): ReactElement => {
    return <DialogProvider>{children}</DialogProvider>;
  };

  it('should not be open initially', () => {

    // Render the hook
    const { result } = renderHook(() => useDialog(), { wrapper });

    // Destructure the result of the hook
    const { isOpen } = result.current;

    // Initially, the dialog should not be open
    expect(isOpen).toBe(false);
  });

  it('should open the dialog when triggered', () => {
    // Render the hook
    const { result } = renderHook(() => useDialog(), { wrapper });

    // Open the dialog using the openDialog function
    act(() => {
      result.current.open({});
    });

    // The dialog should now be open
    expect(result.current.isOpen).toBe(true);
  });

});
