import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useCatalogFeeds,
  useFeedHistory,
  PLATFORM_OPTIONS,
  FORMAT_OPTIONS,
  CatalogPlatform,
  FeedFormat,
} from '@/hooks/useCatalogFeeds';
import { useCategories } from '@/hooks/useCategories';
import { useCatalogExport, CatalogFormat } from '@/hooks/useCatalogExport';
import { Plus, Copy, ExternalLink, Trash2, Edit, TestTube2, Clock, CheckCircle2, XCircle, Link as LinkIcon, Download, FileJson, FileSpreadsheet, FileCode2 } from 'lucide-react';
import { toast } from 'sonner';
import { generateSlug, isValidFeedSlug, getRecommendedCacheDuration } from '@/utils/catalogUtils';

export default function AdminCatalogFeeds() {
  const { feeds, isLoading, createFeed, updateFeed, deleteFeed, getFeedUrl, testFeed } = useCatalogFeeds();
  const { data: categories = [] } = useCategories();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingFeed, setEditingFeed] = useState<string | null>(null);
  const [selectedFeedForHistory, setSelectedFeedForHistory] = useState<string | null>(null);

  // Manual export state
  const [selectedManualFormat, setSelectedManualFormat] = useState<CatalogFormat>('meta');
  const [selectedManualCategories, setSelectedManualCategories] = useState<string[]>([]);
  const {
    catalogData,
    isLoading: exportLoading,
    exportAsJSON,
    exportAsCSV,
    exportAsXML
  } = useCatalogExport(selectedManualCategories.length > 0 ? selectedManualCategories : undefined);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    platform: 'generic' as CatalogPlatform,
    format: 'xml' as FeedFormat,
    feed_url_slug: '',
    is_active: true,
    category_filter: [] as string[],
    include_variants: true,
    cache_duration: 3600,
  });

  const handleCreateFeed = async () => {
    if (!formData.name || !formData.feed_url_slug) {
      toast.error('Name and URL slug are required');
      return;
    }

    if (!isValidFeedSlug(formData.feed_url_slug)) {
      toast.error('URL slug must be lowercase, alphanumeric with hyphens, 3-50 characters');
      return;
    }

    await createFeed.mutateAsync(formData);
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const handleUpdateFeed = async (id: string) => {
    await updateFeed.mutateAsync({ id, ...formData });
    setEditingFeed(null);
    resetForm();
  };

  const handleDeleteFeed = async (id: string) => {
    if (confirm('Are you sure you want to delete this feed? This action cannot be undone.')) {
      await deleteFeed.mutateAsync(id);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      platform: 'generic',
      format: 'xml',
      feed_url_slug: '',
      is_active: true,
      category_filter: [],
      include_variants: true,
      cache_duration: 3600,
    });
  };

  const copyFeedUrl = (slug: string, format: FeedFormat) => {
    const url = getFeedUrl(slug, format);
    navigator.clipboard.writeText(url);
    toast.success('Feed URL copied to clipboard');
  };

  const handlePlatformChange = (platform: CatalogPlatform) => {
    setFormData({
      ...formData,
      platform,
      cache_duration: getRecommendedCacheDuration(platform),
    });
  };

  const generateSlugFromName = () => {
    if (formData.name) {
      setFormData({
        ...formData,
        feed_url_slug: generateSlug(formData.name),
      });
    }
  };

  const handleManualExport = (type: 'json' | 'csv' | 'xml') => {
    try {
      if (type === 'json') {
        exportAsJSON(selectedManualFormat);
      } else if (type === 'csv') {
        exportAsCSV(selectedManualFormat);
      } else {
        exportAsXML(selectedManualFormat);
      }
      const categoryInfo = selectedManualCategories.length > 0
        ? ` (${selectedManualCategories.length} ${selectedManualCategories.length === 1 ? 'category' : 'categories'})`
        : ' (all products)';
      toast.success(`Catalog exported successfully as ${type.toUpperCase()}${categoryInfo}`);
    } catch (error) {
      toast.error('Failed to export catalog');
      console.error('Export error:', error);
    }
  };

  const toggleManualCategory = (categoryId: string) => {
    setSelectedManualCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleAllManualCategories = () => {
    if (selectedManualCategories.length === categories.length && categories.length > 0) {
      setSelectedManualCategories([]);
    } else {
      setSelectedManualCategories(categories.map(c => c.id));
    }
  };

  const MANUAL_PLATFORM_INFO = {
    meta: { name: 'Meta (Facebook/Instagram)', icon: '📱' },
    google: { name: 'Google Merchant Center', icon: '🔍' },
    tiktok: { name: 'TikTok Ads', icon: '🎵' },
    pinterest: { name: 'Pinterest Catalogs', icon: '📌' },
    snapchat: { name: 'Snapchat Ads', icon: '👻' },
    microsoft: { name: 'Microsoft Advertising', icon: '🔷' },
    twitter: { name: 'Twitter Ads', icon: '🐦' },
    linkedin: { name: 'LinkedIn Ads', icon: '💼' },
    generic: { name: 'Generic Format', icon: '📦' }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Catalog Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage automated feeds and export catalogs for advertising platforms
        </p>
      </div>

      <Tabs defaultValue="feeds" className="space-y-6">
        <TabsList>
          <TabsTrigger value="feeds">Automated Feeds</TabsTrigger>
          <TabsTrigger value="manual">Manual Export</TabsTrigger>
        </TabsList>

        <TabsContent value="feeds" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Automated Product Feeds</h2>
              <p className="text-muted-foreground mt-1">
                Create permanent feed URLs that update automatically
              </p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Feed
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Catalog Feed</DialogTitle>
              <DialogDescription>
                Configure a new automated product feed for an advertising platform
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Feed Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Google Shopping Feed - All Products"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform *</Label>
                  <Select
                    value={formData.platform}
                    onValueChange={(value) => handlePlatformChange(value as CatalogPlatform)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PLATFORM_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <span className="flex items-center gap-2">
                            <span>{option.icon}</span>
                            <span>{option.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="format">Format *</Label>
                  <Select
                    value={formData.format}
                    onValueChange={(value) => setFormData({ ...formData, format: value as FeedFormat })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FORMAT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex flex-col items-start">
                            <span>{option.label}</span>
                            <span className="text-xs text-muted-foreground">{option.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug *</Label>
                <div className="flex gap-2">
                  <Input
                    id="slug"
                    value={formData.feed_url_slug}
                    onChange={(e) =>
                      setFormData({ ...formData, feed_url_slug: e.target.value.toLowerCase() })
                    }
                    placeholder="e.g., google-all-products"
                  />
                  <Button type="button" variant="outline" onClick={generateSlugFromName}>
                    Generate
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Lowercase letters, numbers, and hyphens only. This will be part of your feed URL.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Filter by Categories (optional)</Label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded p-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={category.id}
                        checked={formData.category_filter.includes(category.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({
                              ...formData,
                              category_filter: [...formData.category_filter, category.id],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              category_filter: formData.category_filter.filter((id) => id !== category.id),
                            });
                          }
                        }}
                      />
                      <Label htmlFor={category.id} className="text-sm cursor-pointer">
                        {category.name}
                      </Label>
                    </div>
                  ))}
                </div>
                {formData.category_filter.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {formData.category_filter.length} categories selected
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cache">Cache Duration (seconds)</Label>
                <Input
                  id="cache"
                  type="number"
                  value={formData.cache_duration}
                  onChange={(e) =>
                    setFormData({ ...formData, cache_duration: parseInt(e.target.value) || 3600 })
                  }
                  min="60"
                  max="86400"
                />
                <p className="text-xs text-muted-foreground">
                  How long platforms should cache the feed. Recommended:{' '}
                  {getRecommendedCacheDuration(formData.platform)} seconds
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Include Product Variants</Label>
                  <p className="text-xs text-muted-foreground">
                    Create separate entries for each product variant
                  </p>
                </div>
                <Switch
                  checked={formData.include_variants}
                  onCheckedChange={(checked) => setFormData({ ...formData, include_variants: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Active</Label>
                  <p className="text-xs text-muted-foreground">Feed will be publicly accessible</p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateFeed} disabled={createFeed.isPending}>
                Create Feed
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Feeds List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Feeds</CardTitle>
          <CardDescription>
            {feeds.length} feed{feeds.length !== 1 ? 's' : ''} configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading feeds...</p>
          ) : feeds.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No feeds configured yet</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>Create Your First Feed</Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Generated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feeds.map((feed) => {
                  const platform = PLATFORM_OPTIONS.find((p) => p.value === feed.platform);
                  const feedUrl = getFeedUrl(feed.feed_url_slug);

                  return (
                    <TableRow key={feed.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{feed.name}</span>
                          <code className="text-xs text-muted-foreground">{feed.feed_url_slug}</code>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{platform?.icon}</span>
                          <span className="text-sm">{platform?.label}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{feed.format.toUpperCase()}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={feed.is_active ? 'default' : 'secondary'}>
                          {feed.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {feed.last_generated_at ? (
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="h-3 w-3" />
                            {new Date(feed.last_generated_at).toLocaleString()}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyFeedUrl(feed.feed_url_slug, feed.format)}
                            title="Copy Feed URL"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => window.open(feedUrl, '_blank')}
                            title="Open Feed"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => testFeed(feed.feed_url_slug)}
                            title="Test Feed"
                          >
                            <TestTube2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteFeed(feed.id)}
                            title="Delete Feed"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

          {/* Integration Guide */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Integration Guide</CardTitle>
              <CardDescription>How to use your feed URLs with advertising platforms</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {PLATFORM_OPTIONS.map((platform) => (
                <div key={platform.value} className="flex items-start gap-3 p-3 rounded-lg border">
                  <span className="text-2xl">{platform.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-medium">{platform.label}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {platform.value === 'meta' &&
                        'Upload to Commerce Manager → Catalog → Add Items → Data Source → Schedule Upload'}
                      {platform.value === 'google' && 'Upload to Google Merchant Center → Products → Feeds → Add Feed'}
                      {platform.value === 'tiktok' && 'Upload to TikTok Ads Manager → Assets → Catalogs → Create Catalog'}
                      {platform.value === 'pinterest' && 'Upload to Pinterest Business Hub → Catalogs → Create Feed'}
                      {platform.value === 'snapchat' && 'Upload to Snapchat Ads Manager → Assets → Catalog → Upload Products'}
                      {platform.value === 'microsoft' && 'Upload to Microsoft Advertising → Tools → Catalog → Import Products'}
                      {platform.value === 'twitter' && 'Upload to Twitter Ads Manager → Tools → Catalog → Upload'}
                      {platform.value === 'linkedin' && 'Upload to LinkedIn Campaign Manager → Account Assets → Catalogs'}
                      {platform.value === 'generic' && 'Standard format for custom integrations and manual imports'}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold">Manual Catalog Export</h2>
            <p className="text-muted-foreground mt-1">
              Download one-time catalog files for manual uploads
            </p>
          </div>

          {/* Category Filter */}
          <Card>
            <CardHeader>
              <CardTitle>Filter by Category</CardTitle>
              <CardDescription>
                Select specific categories to export, or leave all unchecked to export all products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all-manual"
                    checked={selectedManualCategories.length === categories.length && categories.length > 0}
                    onCheckedChange={toggleAllManualCategories}
                  />
                  <Label htmlFor="select-all-manual" className="font-semibold cursor-pointer">
                    Select All Categories
                  </Label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                  {categories.map(category => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`manual-${category.id}`}
                        checked={selectedManualCategories.includes(category.id)}
                        onCheckedChange={() => toggleManualCategory(category.id)}
                      />
                      <Label htmlFor={`manual-${category.id}`} className="cursor-pointer">
                        {category.name}
                      </Label>
                    </div>
                  ))}
                </div>
                {selectedManualCategories.length > 0 && (
                  <p className="text-sm text-muted-foreground pt-2">
                    {selectedManualCategories.length} {selectedManualCategories.length === 1 ? 'category' : 'categories'} selected • {catalogData.length} products
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Export Options */}
          <Card>
            <CardHeader>
              <CardTitle>Export Catalog</CardTitle>
              <CardDescription>
                Select a platform format and file type to download your catalog
                {selectedManualCategories.length > 0 && ` (${catalogData.length} products from selected categories)`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="manual-platform">Platform Format</Label>
                <Select
                  value={selectedManualFormat}
                  onValueChange={(value) => setSelectedManualFormat(value as CatalogFormat)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(MANUAL_PLATFORM_INFO).map(([key, info]) => (
                      <SelectItem key={key} value={key}>
                        <span className="flex items-center gap-2">
                          <span>{info.icon}</span>
                          <span>{info.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="grid gap-3 md:grid-cols-3">
                <Button
                  onClick={() => handleManualExport('json')}
                  disabled={exportLoading || catalogData.length === 0}
                  className="w-full"
                >
                  <FileJson className="h-4 w-4 mr-2" />
                  Export as JSON
                </Button>

                <Button
                  onClick={() => handleManualExport('csv')}
                  disabled={exportLoading || catalogData.length === 0}
                  className="w-full"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export as CSV
                </Button>

                <Button
                  onClick={() => handleManualExport('xml')}
                  disabled={exportLoading || catalogData.length === 0}
                  className="w-full"
                >
                  <FileCode2 className="h-4 w-4 mr-2" />
                  Export as XML
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Catalog Preview */}
          {catalogData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Catalog Preview</CardTitle>
                <CardDescription>
                  First 5 products in your catalog
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {catalogData.slice(0, 5).map((product) => (
                    <div key={product.id} className="flex items-center gap-3 p-3 rounded-lg border">
                      {product.image_url && (
                        <img
                          src={product.image_url}
                          alt={product.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium">{product.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {product.category} • {product.price} {product.currency}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {product.availability} • SKU: {product.sku || 'N/A'}
                        </p>
                      </div>
                      <Badge variant={product.availability === 'in stock' ? 'default' : 'secondary'}>
                        {product.availability}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
