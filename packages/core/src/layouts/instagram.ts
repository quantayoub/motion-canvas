import {BBox} from '../types/BBox';
import {Vector2} from '../types/Vector';
import {Layout, LayoutConfig} from './Layout';

/**
 * Instagram Reels layout configuration.
 *
 * @remarks
 * Based on 1080x1920 resolution with safe zones to avoid UI overlays.
 * - Top overlays: ~220px (Reels tab, camera icon)
 * - Bottom overlays: ~420-450px (profile, caption, like/comment/share buttons)
 * - Left margin: ~60px
 * - Right margin: ~120-170px (for button stack)
 */
function createInstagramLayoutConfig(): LayoutConfig {
  const width = 1080;
  const height = 1920;

  // Define safe margins based on Instagram Reels UI
  const topMargin = 220;
  const bottomMargin = 450;
  const leftMargin = 60;
  const rightMargin = 150;

  // Calculate safe content area
  const contentArea = new BBox(
    leftMargin,
    topMargin,
    width - leftMargin - rightMargin,
    height - topMargin - bottomMargin,
  );

  return {
    id: 'instagram',
    name: 'Instagram Reels',
    description:
      'Optimized for Instagram Reels (9:16). Safe zones prevent content from being obscured by UI elements.',
    defaultResolution: new Vector2(width, height),
    safeZone: {
      contentArea,
      margins: {
        top: topMargin,
        bottom: bottomMargin,
        left: leftMargin,
        right: rightMargin,
      },
    },
    overlay: {
      draw(ctx: CanvasRenderingContext2D, size: Vector2) {
        const scaleX = size.x / width;
        const scaleY = size.y / height;

        ctx.save();
        ctx.scale(scaleX, scaleY);

        // Semi-transparent overlay for UI areas
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.fillRect(0, 0, width, topMargin);
        ctx.fillRect(0, height - bottomMargin, width, bottomMargin);

        // TOP BAR - Navigation and icons
        const topBarY = 80;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.lineWidth = 3;

        // Top left - Camera/Add icon
        ctx.beginPath();
        ctx.arc(70, topBarY, 28, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(70, topBarY, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(70, topBarY - 9);
        ctx.lineTo(70, topBarY + 9);
        ctx.moveTo(70 - 9, topBarY);
        ctx.lineTo(70 + 9, topBarY);
        ctx.stroke();

        // Instagram logo/Title (centered)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.font =
          'bold 44px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Reels', width / 2, topBarY + 14);

        // Top right - Menu/Messages icon
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(width - 70, topBarY - 15);
        ctx.lineTo(width - 70, topBarY + 15);
        ctx.moveTo(width - 60, topBarY - 8);
        ctx.lineTo(width - 80, topBarY - 8);
        ctx.moveTo(width - 60, topBarY);
        ctx.lineTo(width - 80, topBarY);
        ctx.moveTo(width - 60, topBarY + 8);
        ctx.lineTo(width - 80, topBarY + 8);
        ctx.stroke();

        // Right column - Action buttons (dependency system)
        const rightColumnCenterX = width - 85; // Virtual center line, 85px from right edge
        const firstButtonBottomMargin = 76; // Distance from bottom to first button's bottom edge
        const buttonSize = 75; // Button dimensions (75x75px)
        const buttonBorderRadius = 12; // Button border radius
        const threeDotsMarginFromFirstButtonTop = 67; // Gap between first button top and three dots

        // Calculate first button position from bottom
        const firstButtonBottom = height - firstButtonBottomMargin;
        const firstButtonCenterY = firstButtonBottom - buttonSize / 2; // Center Y of first button
        const firstButtonTop = firstButtonCenterY - buttonSize / 2; // Top edge of first button

        // Calculate three dots position (67px above first button top)
        const threeDotsCenterY =
          firstButtonTop - threeDotsMarginFromFirstButtonTop;

        const drawShare = (x: number, y: number) => {
          // Share icon: rectangle outline (empty inside)
          // Dimensions: 74px width, 62px height, 6px line thickness
          const iconWidth = 74;
          const iconHeight = 62;

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
          ctx.lineWidth = 6;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          // Draw rectangle centered at (x, y)
          const rectX = x - iconWidth / 2;
          const rectY = y - iconHeight / 2;

          ctx.strokeRect(rectX, rectY, iconWidth, iconHeight);
        };

        const drawRepost = (x: number, y: number) => {
          // Repost icon: rectangle outline (empty inside)
          // Dimensions: 74px width, 84px height, 6px line thickness
          const iconWidth = 74;
          const iconHeight = 84;

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
          ctx.lineWidth = 6;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          // Draw rectangle centered at (x, y)
          const rectX = x - iconWidth / 2;
          const rectY = y - iconHeight / 2;

          ctx.strokeRect(rectX, rectY, iconWidth, iconHeight);
        };

        const drawMoreDots = (x: number, centerY: number) => {
          // Exact dimensions: each dot 10px diameter, 7px spacing between dots, total height 44px
          const dotDiameter = 10;
          const dotRadius = dotDiameter / 2;
          const spacingBetweenDots = 7; // Space between adjacent dot edges

          // Calculate vertical positions: spacing is measured between dot edges
          // Middle dot center at centerY, so:
          // - Top dot center: centerY - dotRadius - spacing - dotRadius = centerY - 12
          // - Bottom dot center: centerY + dotRadius + spacing + dotRadius = centerY + 12
          const topDotCenterY =
            centerY - dotRadius - spacingBetweenDots - dotRadius;
          const middleDotCenterY = centerY;
          const bottomDotCenterY =
            centerY + dotRadius + spacingBetweenDots + dotRadius;

          ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';

          // Top dot
          ctx.beginPath();
          ctx.arc(x, topDotCenterY, dotRadius, 0, Math.PI * 2);
          ctx.fill();

          // Middle dot
          ctx.beginPath();
          ctx.arc(x, middleDotCenterY, dotRadius, 0, Math.PI * 2);
          ctx.fill();

          // Bottom dot
          ctx.beginPath();
          ctx.arc(x, bottomDotCenterY, dotRadius, 0, Math.PI * 2);
          ctx.fill();
        };

        // Draw three dots menu (67px above first button top)
        drawMoreDots(rightColumnCenterX, threeDotsCenterY);

        // Calculate three dots component edges for dependency system
        // Top dot center: threeDotsCenterY - 12, radius: 5
        const threeDotsTop = threeDotsCenterY - 12 - 5; // Top dot center - radius = top edge

        // Share count text: positioned from three dots top reference
        // Go up 72px from three dots top (subtract in canvas coords)
        // Text height: 28px
        // Text center should be at 86px from three dots top (72 + 28/2 = 72 + 14 = 86)
        const shareTextHeight = 28;
        const shareTextCenterY = threeDotsTop - 86; // Center at 86px up from three dots top (72 + 14)
        const shareTextTop = shareTextCenterY - shareTextHeight / 2; // Text top edge

        // Share icon: positioned from share text top reference
        // Go up 36px from text top, then center the 62px icon
        // Icon center = text top - (36 + 62/2) = text top - 67
        const shareIconTextPadding = 36; // 36px up from text top
        const shareIconHeight = 62; // Icon height
        const shareIconCenterY =
          shareTextTop - (shareIconTextPadding + shareIconHeight / 2); // Center at 67px up from text top

        // Draw share icon (6px thick rectangle, 74px width, 62px height)
        drawShare(rightColumnCenterX, shareIconCenterY);
        const shareIconTop = shareIconCenterY - shareIconHeight / 2; // Share icon top edge

        // Draw share count text
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.font = `bold ${shareTextHeight}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('123', rightColumnCenterX, shareTextCenterY);

        // Repost count text: positioned from share icon top reference
        // Go up 65px from share icon top, then center the 28px text
        // Text center = share icon top - (65 + 28/2) = share icon top - 79
        const repostTextMarginFromShareIconTop = 65; // 65px up from share icon top
        const repostTextHeight = 28; // Text height
        const repostTextCenterY =
          shareIconTop -
          (repostTextMarginFromShareIconTop + repostTextHeight / 2); // Center at 79px up from share icon top
        const repostTextTop = repostTextCenterY - repostTextHeight / 2; // Repost text top edge

        // Repost icon: positioned from repost text top reference
        // Go up 27px from text top, then center the 84px icon
        // Icon center = text top - (27 + 84/2) = text top - 69
        const repostIconTextPadding = 27; // 27px up from text top
        const repostIconHeight = 84; // Icon height
        const repostIconCenterY =
          repostTextTop - (repostIconTextPadding + repostIconHeight / 2); // Center at 69px up from text top
        const repostIconTop = repostIconCenterY - repostIconHeight / 2; // Repost icon top edge

        // Draw repost icon (6px thick rectangle, 74px width, 84px height)
        drawRepost(rightColumnCenterX, repostIconCenterY);

        // Draw repost count text
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.font = `bold ${repostTextHeight}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('456', rightColumnCenterX, repostTextCenterY);

        // Comment count text: positioned from repost icon top reference
        // Go up 52px from repost icon top, then center the 28px text
        // Text center = repost icon top - (52 + 28/2) = repost icon top - 66
        const commentTextMarginFromRepostIconTop = 52; // 52px up from repost icon top
        const commentTextHeight = 28; // Text height
        const commentTextCenterY =
          repostIconTop -
          (commentTextMarginFromRepostIconTop + commentTextHeight / 2); // Center at 66px up from repost icon top
        const commentTextTop = commentTextCenterY - commentTextHeight / 2; // Comment text top edge

        // Comment icon: positioned from comment text top reference
        // Go up 33px from text top, then center the 74px icon
        // Icon center = text top - (33 + 74/2) = text top - 70
        const commentIconTextPadding = 33; // 33px up from text top
        const commentIconSize = 74; // Icon size (74x74px square)
        const commentIconCenterY =
          commentTextTop - (commentIconTextPadding + commentIconSize / 2); // Center at 70px up from text top
        const commentIconTop = commentIconCenterY - commentIconSize / 2; // Comment icon top edge

        // Draw comment icon (6px thick rectangle, 74x74px square)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        const commentIconX = rightColumnCenterX - commentIconSize / 2;
        const commentIconY = commentIconCenterY - commentIconSize / 2;
        ctx.strokeRect(
          commentIconX,
          commentIconY,
          commentIconSize,
          commentIconSize,
        );

        // Draw comment count text
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.font = `bold ${commentTextHeight}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('789', rightColumnCenterX, commentTextCenterY);

        // Likes count text: positioned from comment icon top reference
        // Go up 58px from comment icon top, then center the 28px text
        // Text center = comment icon top - (58 + 28/2) = comment icon top - 72
        const likesTextMarginFromCommentIconTop = 58; // 58px up from comment icon top
        const likesTextHeight = 28; // Text height
        const likesTextCenterY =
          commentIconTop -
          (likesTextMarginFromCommentIconTop + likesTextHeight / 2); // Center at 72px up from comment icon top
        const likesTextTop = likesTextCenterY - likesTextHeight / 2; // Likes text top edge

        // Likes icon: positioned from likes text top reference
        // Go up 36px from text top, then center the 66px icon
        // Icon center = text top - (36 + 66/2) = text top - 69
        const likesIconTextPadding = 36; // 36px up from text top
        const likesIconHeight = 66; // Icon height
        const likesIconWidth = 74; // Icon width
        const likesIconCenterY =
          likesTextTop - (likesIconTextPadding + likesIconHeight / 2); // Center at 69px up from text top

        // Draw likes icon (6px thick rectangle, 74px width, 66px height)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        const likesIconX = rightColumnCenterX - likesIconWidth / 2;
        const likesIconY = likesIconCenterY - likesIconHeight / 2;
        ctx.strokeRect(likesIconX, likesIconY, likesIconWidth, likesIconHeight);

        // Draw likes count text
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.font = `bold ${likesTextHeight}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('1.2K', rightColumnCenterX, likesTextCenterY);

        // Draw first button (75x75px with 12px border radius)
        const actionButtonX = rightColumnCenterX - buttonSize / 2;
        const actionButtonY = firstButtonCenterY - buttonSize / 2;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.moveTo(actionButtonX + buttonBorderRadius, actionButtonY);
        ctx.lineTo(
          actionButtonX + buttonSize - buttonBorderRadius,
          actionButtonY,
        );
        ctx.quadraticCurveTo(
          actionButtonX + buttonSize,
          actionButtonY,
          actionButtonX + buttonSize,
          actionButtonY + buttonBorderRadius,
        );
        ctx.lineTo(
          actionButtonX + buttonSize,
          actionButtonY + buttonSize - buttonBorderRadius,
        );
        ctx.quadraticCurveTo(
          actionButtonX + buttonSize,
          actionButtonY + buttonSize,
          actionButtonX + buttonSize - buttonBorderRadius,
          actionButtonY + buttonSize,
        );
        ctx.lineTo(
          actionButtonX + buttonBorderRadius,
          actionButtonY + buttonSize,
        );
        ctx.quadraticCurveTo(
          actionButtonX,
          actionButtonY + buttonSize,
          actionButtonX,
          actionButtonY + buttonSize - buttonBorderRadius,
        );
        ctx.lineTo(actionButtonX, actionButtonY + buttonBorderRadius);
        ctx.quadraticCurveTo(
          actionButtonX,
          actionButtonY,
          actionButtonX + buttonBorderRadius,
          actionButtonY,
        );
        ctx.closePath();
        ctx.fill();

        // Bottom left - Profile and caption (dependency system: Bottom → Caption → Circle)
        const captionBottomMargin = 65;
        const captionHeight = 46;
        const captionMarginFromCircle = 31;
        const profilePicRadius = 62;
        const profileXLeftMargin = 45;

        const captionBottom = height - captionBottomMargin;
        const captionTop = captionBottom - captionHeight;
        const circleBottom = captionTop - captionMarginFromCircle;
        const profileY = circleBottom - profilePicRadius;
        const profileX = profileXLeftMargin + profilePicRadius;

        // Profile picture
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(profileX, profileY, profilePicRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(200, 200, 200, 0.9)';
        ctx.beginPath();
        ctx.arc(profileX, profileY, profilePicRadius - 1, 0, Math.PI * 2);
        ctx.fill();

        // Username
        const usernameMargin = 22;
        const usernameHeight = 43;
        const usernameX = profileX + profilePicRadius + usernameMargin;
        const usernameText = 'quant_ayoub';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.font = `bold ${usernameHeight * 0.65}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(usernameText, usernameX, profileY);

        // Follow button
        const buttonText = 'Follow';
        const buttonMargin = 35;
        const buttonWidth = 190;
        const buttonHeight = 82;
        const borderRadius = 24;
        const buttonX =
          usernameX + ctx.measureText(usernameText).width + buttonMargin;
        const buttonY = profileY - buttonHeight / 2;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.beginPath();
        ctx.moveTo(buttonX + borderRadius, buttonY);
        ctx.lineTo(buttonX + buttonWidth - borderRadius, buttonY);
        ctx.quadraticCurveTo(
          buttonX + buttonWidth,
          buttonY,
          buttonX + buttonWidth,
          buttonY + borderRadius,
        );
        ctx.lineTo(
          buttonX + buttonWidth,
          buttonY + buttonHeight - borderRadius,
        );
        ctx.quadraticCurveTo(
          buttonX + buttonWidth,
          buttonY + buttonHeight,
          buttonX + buttonWidth - borderRadius,
          buttonY + buttonHeight,
        );
        ctx.lineTo(buttonX + borderRadius, buttonY + buttonHeight);
        ctx.quadraticCurveTo(
          buttonX,
          buttonY + buttonHeight,
          buttonX,
          buttonY + buttonHeight - borderRadius,
        );
        ctx.lineTo(buttonX, buttonY + borderRadius);
        ctx.quadraticCurveTo(buttonX, buttonY, buttonX + borderRadius, buttonY);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.font = `bold ${Math.round(buttonHeight * 0.35)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(buttonText, buttonX + buttonWidth / 2, profileY);

        // Caption
        ctx.textBaseline = 'alphabetic';
        const captionLeftMargin = 47;
        const captionX = captionLeftMargin;
        const captionY = captionTop + captionHeight * 0.85;
        const captionMaxWidth = width - captionLeftMargin - rightMargin - 20;
        const captionText = 'Gonna have to change strategies 😂';

        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.font = `${Math.round(captionHeight * 0.68)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.textAlign = 'left';

        let displayText = captionText;
        if (ctx.measureText(captionText).width > captionMaxWidth) {
          const ellipsis = '...';
          let truncatedText = captionText;
          while (
            ctx.measureText(truncatedText + ellipsis).width > captionMaxWidth &&
            truncatedText.length > 0
          ) {
            truncatedText = truncatedText.slice(0, -1);
          }
          displayText = truncatedText + ellipsis;
        }

        ctx.fillText(displayText, captionX, captionY);

        // Safe zone indicator
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 3]);
        ctx.strokeRect(
          contentArea.x,
          contentArea.y,
          contentArea.width,
          contentArea.height,
        );
        ctx.setLineDash([]);

        ctx.restore();
      },
      opacity: 0.85,
    },
  };
}

// Lazy initialization to avoid circular dependency issues
let INSTAGRAM_LAYOUT_CACHE: Layout | null = null;

/**
 * Get the Instagram Reels layout instance.
 *
 * @returns The Instagram layout.
 */
export function getInstagramLayout(): Layout {
  if (!INSTAGRAM_LAYOUT_CACHE) {
    INSTAGRAM_LAYOUT_CACHE = new Layout(createInstagramLayoutConfig());
  }
  return INSTAGRAM_LAYOUT_CACHE;
}
