import "./PickupDropBadge.css";
interface Props {
  capabilities: {
    self_pickup: boolean;
    doorstep_drop: boolean;
  };
}

export default function PickupDropBadge({ capabilities }: Props) {
  if (!capabilities.doorstep_drop) {
    return <span className="badge badge-gray">Self pick-up only</span>;
  }

  return (
    <span className="badge badge-green">Pick & drop service available</span>
  );
}
