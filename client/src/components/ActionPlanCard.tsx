import { useState } from "react";
import { Card, Form, Badge, Button } from "react-bootstrap";
import { CheckCircle2, Circle } from "lucide-react";
import type { ActionPlanTask } from "../types";
import { formatCurrency, formatDateTime, priorityVariant } from "../utils/format";

interface ActionPlanCardProps {
  task: ActionPlanTask;
  onToggleComplete: (taskId: string, completed: boolean) => void;
  onSaveNotes: (taskId: string, notes: string) => void;
}

export default function ActionPlanCard({ task, onToggleComplete, onSaveNotes }: ActionPlanCardProps) {
  const [notes, setNotes] = useState(task.notes || "");
  const [dirty, setDirty] = useState(false);

  return (
    <Card className={`fmb-card h-100 ${task.completed ? "border-success" : ""}`}>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <Badge bg="light" text="dark" className="border">
            Day {task.day}
          </Badge>
          <Badge bg={priorityVariant(task.priority)}>{task.priority}</Badge>
        </div>
        <Card.Title className="h6">{task.title}</Card.Title>
        <Card.Text className="small fmb-muted">{task.description}</Card.Text>
        <div className="small mb-2">
          <div>
            <strong>Estimated cost:</strong> {formatCurrency(task.estimatedCost)}
          </div>
          <div>
            <strong>Expected output:</strong> {task.expectedOutput}
          </div>
        </div>

        <Form.Group className="mb-2">
          <Form.Label className="small fw-medium mb-1">Notes</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              setDirty(true);
            }}
            placeholder="What happened when you tried this?"
          />
          {dirty && (
            <Button
              size="sm"
              variant="link"
              className="p-0 mt-1"
              onClick={() => {
                onSaveNotes(task.id, notes);
                setDirty(false);
              }}
            >
              Save notes
            </Button>
          )}
        </Form.Group>

        <Button
          size="sm"
          variant={task.completed ? "success" : "outline-secondary"}
          className="d-flex align-items-center gap-1 w-100 justify-content-center"
          onClick={() => onToggleComplete(task.id, !task.completed)}
        >
          {task.completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
          {task.completed ? "Completed" : "Mark Complete"}
        </Button>
        {task.completed && task.completedAt && (
          <div className="text-center fmb-muted small mt-1">Completed {formatDateTime(task.completedAt)}</div>
        )}
      </Card.Body>
    </Card>
  );
}
