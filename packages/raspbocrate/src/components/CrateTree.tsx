import {
  ChevronDown,
  ChevronRight,
  File,
  FileText,
  Folder,
  Image,
  Music,
  Package,
  Video,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type {
  CrateEntity,
  CrateTreeNode,
  MediaFile,
  RoCrateInfo,
} from '@/types/rocrate';

type MediaFileItemProps = {
  file: MediaFile;
};

const getMediaIcon = (encodingFormat?: string) => {
  if (!encodingFormat) return File;

  if (encodingFormat.startsWith('image/')) return Image;
  if (encodingFormat.startsWith('audio/')) return Music;
  if (encodingFormat.startsWith('video/')) return Video;
  if (encodingFormat.startsWith('text/')) return FileText;

  return File;
};

const MediaFileItem = ({ file }: MediaFileItemProps) => {
  const Icon = getMediaIcon(file.encodingFormat);

  return (
    <div className="flex items-center gap-2 py-1 px-2 text-sm text-muted-foreground hover:bg-accent/50 rounded">
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate flex-1">{file.name}</span>
      {file.contentSize && (
        <span className="text-xs text-muted-foreground/70">
          {file.contentSize}
        </span>
      )}
    </div>
  );
};

type EntityNodeProps = {
  entity: CrateEntity;
  level: number;
};

const EntityNode = ({ entity, level }: EntityNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const hasChildren =
    entity.children.length > 0 || entity.mediaFiles.length > 0;

  const getTypeIcon = () => {
    const types = Array.isArray(entity.type) ? entity.type : [entity.type];

    if (types.includes('Dataset')) return Folder;
    if (types.includes('RepositoryCollection')) return Package;

    return Folder;
  };

  const TypeIcon = getTypeIcon();

  return (
    <div className="select-none">
      <div
        className={cn(
          'flex items-center gap-1 py-1 px-2 rounded cursor-pointer hover:bg-accent/50',
          level === 0 && 'font-medium',
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
      >
        {hasChildren ? (
          isExpanded ? (
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          )
        ) : (
          <span className="w-4" />
        )}
        <TypeIcon className="h-4 w-4 shrink-0 text-blue-500" />
        <span className="truncate">{entity.name}</span>
        {entity.mediaFiles.length > 0 && (
          <span className="text-xs text-muted-foreground ml-auto">
            {entity.mediaFiles.length} file
            {entity.mediaFiles.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {isExpanded && hasChildren && (
        <div>
          {entity.children.map((child) => (
            <EntityNode key={child.id} entity={child} level={level + 1} />
          ))}
          {entity.mediaFiles.length > 0 && (
            <div style={{ paddingLeft: `${(level + 1) * 16 + 8}px` }}>
              {entity.mediaFiles.map((file) => (
                <MediaFileItem key={file.id} file={file} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

type CrateCardProps = {
  crate: RoCrateInfo;
  level?: number;
};

const CrateCard = ({ crate, level = 0 }: CrateCardProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className={cn('rounded-lg border bg-card', level > 0 && 'ml-6 mt-2')}>
      <div
        className="p-4 border-b cursor-pointer hover:bg-accent/30"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <Package className="h-5 w-5 text-primary" />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{crate.name}</h3>
            <p className="text-xs text-muted-foreground truncate">
              {crate.path}
            </p>
          </div>
        </div>
        {crate.description && (
          <p className="text-sm text-muted-foreground mt-2 ml-6">
            {crate.description}
          </p>
        )}
      </div>
      {isExpanded && (
        <div className="p-2">
          <EntityNode entity={crate.rootEntity} level={0} />
        </div>
      )}
    </div>
  );
};

type CrateTreeNodeComponentProps = {
  node: CrateTreeNode;
  level?: number;
};

const CrateTreeNodeComponent = ({
  node,
  level = 0,
}: CrateTreeNodeComponentProps) => {
  return (
    <div>
      <CrateCard crate={node.crate} level={level} />
      {node.children.length > 0 && (
        <div className="ml-4 border-l-2 border-muted pl-2">
          {node.children.map((child) => (
            <CrateTreeNodeComponent
              key={child.crate.path}
              node={child}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

type CrateTreeListProps = {
  crateTree: CrateTreeNode[];
};

export const CrateTreeList = ({ crateTree }: CrateTreeListProps) => {
  if (crateTree.length === 0) {
    return (
      <div className="text-center py-12 rounded-lg border bg-card">
        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          No RO-Crates found on this drive
        </p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          RO-Crates should contain a ro-crate-metadata.json file
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {crateTree.map((node) => (
        <CrateTreeNodeComponent key={node.crate.path} node={node} />
      ))}
    </div>
  );
};
