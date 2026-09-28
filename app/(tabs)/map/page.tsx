import { MapScreen } from "@/components/map/MapScreen";
import { getMockFoundReports, MOCK_FLOOD_AREA, MOCK_USER_LOCATION } from "@/lib/mock/data";

export default function MapPage() {
  const now = new Date();
  return (
    <MapScreen
      reports={getMockFoundReports(now)}
      now={now.toISOString()}
      initialLocation={MOCK_USER_LOCATION}
      floodArea={MOCK_FLOOD_AREA}
    />
  );
}
