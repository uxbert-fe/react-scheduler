import { useEffect, useReducer, ReactChild } from "react";
import { getAvailableViews, getOneView } from "../../helpers/generals";
import { EventActions, ProcessedEvent, SchedulerProps } from "../../Scheduler";
import {
  defaultProps,
  SchedulerState,
  SelectedRange,
  StateContext,
} from "./stateContext";
import { stateReducer } from "./stateReducer";

interface AppProps {
  children: ReactChild;
  initial: SchedulerProps;
}

const initialState = (initial: SchedulerProps): SchedulerState => {
  const initialView = initial[initial.view]
    ? initial.view
    : getOneView(initial);
  return {
    ...initial,
    view: initialView,
    dialog: false,
    mounted: false,
    selectedRange: undefined,
    fields: [...defaultProps.fields, ...initial.fields],
  };
};

const AppState = ({ initial, children }: AppProps) => {
  const {
    events,
    resources,
    resourceViewMode,
    month,
    week,
    day,
    fields,
    locale,
    direction,
    loading,
  } = initial;
  const [state, dispatch] = useReducer(stateReducer, initialState(initial));

  const handleState = (
    value: SchedulerState[keyof SchedulerState],
    name: keyof SchedulerState
  ) => {
    dispatch({ type: "set", payload: { name, value } });
  };

  const updateProps = (updatedProps: any) => {
    dispatch({ type: "updateProps", payload: updatedProps });
  };
  useEffect(() => {
    if (state.mounted) {
      updateProps({
        events,
        resources,
        resourceViewMode,
        month,
        week,
        day,
        fields,
        locale,
        direction,
        loading,
      });
    } else {
      handleState(true, "mounted");
    }
    //eslint-disable-next-line
  }, [
    events,
    resources,
    resourceViewMode,
    month,
    week,
    day,
    fields,
    locale,
    direction,
    loading,
  ]);

  const confirmEvent = (event: ProcessedEvent, action: EventActions) => {
    let updatedEvents: ProcessedEvent[];
    if (action === "edit") {
      updatedEvents = state.events.map((e) =>
        e.event_id === event.event_id ? event : e
      );
    } else {
      updatedEvents = [...state.events, event];
    }
    handleState(updatedEvents, "events");
  };

  const getViews = () => getAvailableViews(state);

  const triggerDialog = (
    status: boolean | undefined,
    selected: SelectedRange | ProcessedEvent
  ) => {
    dispatch({ type: "triggerDialog", payload: { status, selected } });
  };
  const triggerLoading = (status: boolean) => {
    dispatch({ type: "triggerLoading", payload: status });
  };
  const handleGotoDay = (day: Date) => {
    const views = getViews();
    if (views.includes("day")) {
      handleState("day", "view");
      handleState(day, "selectedDate");
    } else if (views.includes("week")) {
      handleState("week", "view");
      handleState(day, "selectedDate");
    } else {
      console.warn("No Day/Week views available");
    }
  };
  return (
    <StateContext.Provider
      value={{
        ...state,
        handleState,
        getViews,
        triggerDialog,
        triggerLoading,
        handleGotoDay,
        confirmEvent,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export { AppState };
