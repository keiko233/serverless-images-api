import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@libnyanpasu/material-design-react";
import MaterialSymbolsCalendarViewMonth from "~icons/material-symbols/calendar-view-month";
import MaterialSymbolsCloseRounded from "~icons/material-symbols/close-rounded";
import MaterialSymbolsGridViewRounded from "~icons/material-symbols/grid-view-rounded";
import Link from "next/link";
import {
  GetImagesParams,
  getImagesUserOrderByFields,
} from "@/actions/query/schema";
import { DEFAULT_CARD_PAGE_SIZE } from "@/consts";
import { PageSearchParams } from "../page";

const LIMIT_LENGTH = 5;

const PageLimit = ({ defaultValues }: { defaultValues?: GetImagesParams }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="flat">
          {defaultValues?.limit
            ? `Page Limit: ${defaultValues.limit}`
            : "Page Limit"}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuLabel>Page Limit</DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuRadioGroup
          value={String(defaultValues?.limit ?? DEFAULT_CARD_PAGE_SIZE)}
        >
          {Array.from({ length: LIMIT_LENGTH }).map((_, i) => {
            const index = i + 1;
            const limit = index * DEFAULT_CARD_PAGE_SIZE;

            return (
              <Link
                key={index}
                href={{
                  query: {
                    ...defaultValues,
                    limit,
                  },
                }}
              >
                <DropdownMenuRadioItem value={String(limit)}>
                  {limit} per page
                </DropdownMenuRadioItem>
              </Link>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const Characters = ({
  defaultValues,
  characters,
}: {
  defaultValues?: GetImagesParams;
  characters: string[] | null;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="flat">
          {defaultValues?.character
            ? `Character: ${defaultValues.character}`
            : "Character Filter"}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuLabel className="pr-2">Character Filter</DropdownMenuLabel>

        <DropdownMenuSeparator />

        {defaultValues?.character && (
          <Link
            href={{
              query: {
                ...defaultValues,
                character: null,
              },
            }}
          >
            <DropdownMenuItem>
              <span>Clear</span>

              <MaterialSymbolsCloseRounded className="size-6" />
            </DropdownMenuItem>
          </Link>
        )}

        {characters?.map((character) => (
          <Link
            key={character}
            href={{
              query: {
                ...defaultValues,
                character,
              },
            }}
          >
            <DropdownMenuCheckboxItem
              checked={defaultValues?.character === character}
            >
              {character}
            </DropdownMenuCheckboxItem>
          </Link>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const QueryOrder = ({ defaultValues }: { defaultValues?: GetImagesParams }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="flat">
          {defaultValues?.orderBy
            ? `Order By: ${defaultValues.orderBy}`
            : "Query Order"}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuLabel className="pr-2">Query Order</DropdownMenuLabel>

        <DropdownMenuSeparator />

        {defaultValues?.orderBy && (
          <Link
            href={{
              query: {
                ...defaultValues,
                orderBy: null,
              },
            }}
          >
            <DropdownMenuItem>
              <span>Reset Default</span>

              <MaterialSymbolsCloseRounded className="size-6" />
            </DropdownMenuItem>
          </Link>
        )}

        {getImagesUserOrderByFields.map((orderBy) => (
          <Link
            key={orderBy}
            href={{
              query: {
                ...defaultValues,
                orderBy,
              },
            }}
          >
            <DropdownMenuCheckboxItem
              checked={defaultValues?.orderBy === orderBy}
              className="capitalize"
            >
              {orderBy}
            </DropdownMenuCheckboxItem>
          </Link>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const QueryDirection = ({
  defaultValues,
}: {
  defaultValues?: GetImagesParams;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="flat">
          {defaultValues?.direction
            ? `Direction: ${defaultValues.direction}`
            : "Query Direction"}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuLabel className="pr-2">Query Direction</DropdownMenuLabel>

        <DropdownMenuSeparator />

        {defaultValues?.direction && (
          <Link
            href={{
              query: {
                ...defaultValues,
                direction: null,
              },
            }}
          >
            <DropdownMenuItem>
              <span>Reset Default</span>

              <MaterialSymbolsCloseRounded className="size-6" />
            </DropdownMenuItem>
          </Link>
        )}

        {["asc", "desc"].map((direction) => (
          <Link
            key={direction}
            href={{
              query: {
                ...defaultValues,
                direction,
              },
            }}
          >
            <DropdownMenuCheckboxItem
              checked={defaultValues?.direction === direction}
              className="capitalize"
            >
              {direction}
            </DropdownMenuCheckboxItem>
          </Link>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const ColsButton = ({
  defaultValues,
}: {
  defaultValues?: PageSearchParams;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          {defaultValues?.cols
            ? `Grid Cols: ${defaultValues.cols}`
            : "Grid Cols"}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuLabel className="pr-2">Grid Cols</DropdownMenuLabel>

        <DropdownMenuSeparator />

        {defaultValues?.cols && (
          <Link
            href={{
              query: {
                ...defaultValues,
                cols: null,
              },
            }}
          >
            <DropdownMenuItem>
              <span>Reset Default</span>

              <MaterialSymbolsCloseRounded className="size-6" />
            </DropdownMenuItem>
          </Link>
        )}

        {Array.from({ length: 5 }).map((_, i) => {
          const index = i + 1;

          return (
            <Link
              key={index}
              href={{
                query: {
                  ...defaultValues,
                  cols: index,
                },
              }}
            >
              <DropdownMenuItem>{index}</DropdownMenuItem>
            </Link>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const QueryForm = ({
  defaultValues,
  characters,
}: {
  defaultValues?: PageSearchParams;
  characters: string[] | null;
}) => {
  const mapping = {
    normal: MaterialSymbolsCalendarViewMonth,
    small: MaterialSymbolsGridViewRounded,
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-4">
        <QueryOrder defaultValues={defaultValues} />

        <QueryDirection defaultValues={defaultValues} />

        <div className="flex-1" />

        <Characters defaultValues={defaultValues} characters={characters} />

        <PageLimit defaultValues={defaultValues} />
      </div>

      <div className="flex justify-end gap-1">
        <ColsButton defaultValues={defaultValues} />

        {Object.entries(mapping).map(([cardType, Icon]) => {
          const isCurrent = defaultValues?.cardType === cardType;

          return (
            <Link
              key={cardType}
              href={{
                query: {
                  ...defaultValues,
                  cardType,
                },
              }}
            >
              <Button icon variant={isCurrent ? "flat" : undefined}>
                <Icon className="size-6" />
              </Button>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
